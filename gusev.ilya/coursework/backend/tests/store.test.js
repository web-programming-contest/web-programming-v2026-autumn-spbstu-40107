const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {createApp} = require('../server');
let directory;
let server;
let base;
const valid = {
  items: [{id: 1, quantity: 2}],
  phone: '+7 (999) 123-45-67',
  email: 'test@example.com',
  delivery: 'pickup',
  payment: 'card',
  packaging: false,
};
async function request(
  route,
  {cookie, body, method = body ? 'POST' : 'GET'} = {},
) {
  const response = await fetch(base + route, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? {Cookie: cookie} : {}),
    },
    ...(body ? {body: JSON.stringify(body)} : {}),
  });
  const data = await response.json();
  return {
    status: response.status,
    data,
    cookie: response.headers.get('set-cookie')?.split(';')[0],
  };
}
async function login(username = 'admin') {
  const result = await request('/login', {body: {username, password: '12345'}});
  assert.equal(result.status, 200);
  return result.cookie;
}
before(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), 'gadget-hub-tests-'));
  await fs.copyFile(
    path.join(__dirname, '../data/goods.json'),
    path.join(directory, 'goods.json'),
  );
  await fs.writeFile(
    path.join(directory, 'users.json'),
    JSON.stringify([
      {id: 1, username: 'admin', password: '12345'},
      {id: 2, username: 'second', password: '12345'},
    ]),
  );
  await fs.writeFile(path.join(directory, 'orders.json'), '[]');
  server = createApp({
    dataDir: directory,
    secret: 'test-session-secret',
  }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(directory, {recursive: true, force: true});
});

test('Public catalogue uses existing images and valid product data', async () => {
  const response = await request('/goods');
  assert.equal(response.status, 200);
  assert.ok(response.data.length >= 30);
  const ids = new Set();
  for (const item of response.data) {
    assert.ok(!ids.has(item.id));
    ids.add(item.id);
    assert.ok(item.price > 0 && item.rating >= 0 && item.rating <= 5);
    await fs.access(path.join(__dirname, '../../frontend/public', item.image));
  }
});
test('Login validation, session persistence, protected routes and logout', async () => {
  assert.equal((await request('/orders')).status, 401);
  assert.equal((await request('/orders', {body: valid})).status, 401);
  assert.equal(
    (await request('/login', {body: {username: '', password: ''}})).status,
    400,
  );
  assert.equal(
    (await request('/login', {body: {username: 'admin', password: 'wrong'}}))
      .status,
    401,
  );
  const cookie = await login();
  assert.deepEqual((await request('/me', {cookie})).data, {
    id: 1,
    username: 'admin',
  });
  assert.equal((await request('/logout', {cookie, body: {}})).status, 200);
  assert.equal((await request('/me', {cookie})).status, 401);
});
test('Order totals come from server; history is isolated by account', async () => {
  const cookie = await login();
  const result = await request('/orders', {
    cookie,
    body: {
      ...valid,
      items: [{id: 1, quantity: 2, price: 1}],
      address: 'Must not be stored for pickup',
    },
  });
  assert.equal(result.status, 201);
  assert.equal(result.data.total, 55980);
  assert.equal(result.data.address, '');
  const other = await login('second');
  assert.deepEqual((await request('/orders', {cookie: other})).data, []);
  const history = (await request('/orders', {cookie})).data;
  assert.ok(history.some((o) => o.id === result.data.id));
});
test('Invalid contacts, address, payment, items and quantities are rejected', async () => {
  const cookie = await login();
  for (const patch of [
    {phone: 'abc123'},
    {email: 'bad@'},
    {delivery: 'delivery', address: ''},
    {payment: ''},
    {items: []},
    {items: [null]},
    {items: [{id: 999999, quantity: 1}]},
    {items: [{id: 1, quantity: 0}]},
    {items: [{id: 1, quantity: 100}]},
    {items: [{id: 1, quantity: 1.5}]},
    {
      items: [
        {id: 1, quantity: 1},
        {id: 1, quantity: 2},
      ],
    },
  ]) {
    assert.equal(
      (await request('/orders', {cookie, body: {...valid, ...patch}})).status,
      400,
      JSON.stringify(patch),
    );
  }
  const delivery = await request('/orders', {
    cookie,
    body: {
      ...valid,
      delivery: 'delivery',
      address: 'Тестовый город, улица 1',
      payment: 'cash',
    },
  });
  assert.equal(delivery.status, 201);
  assert.equal(delivery.data.address, 'Тестовый город, улица 1');
});
test('Twenty simultaneous orders are all saved with unique numbers', async () => {
  const cookie = await login();
  const previous = (await request('/orders', {cookie})).data.length;
  const results = await Promise.all(
    Array.from({length: 20}, () => request('/orders', {cookie, body: valid})),
  );
  assert.ok(results.every((r) => r.status === 201));
  assert.equal(new Set(results.map((r) => r.data.id)).size, 20);
  assert.equal(new Set(results.map((r) => r.data.number)).size, 20);
  assert.equal((await request('/orders', {cookie})).data.length, previous + 20);
});
test('Retries with the same request ID create one order', async () => {
  const cookie = await login();
  const body = {...valid, clientRequestId: 'same-request-12345'};
  const results = await Promise.all(
    Array.from({length: 5}, () => request('/orders', {cookie, body})),
  );
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(new Set(results.map((r) => r.data.id)).size, 1);
});
test('JSON read and write failures return errors; the write queue recovers', async () => {
  const cookie = await login();
  const file = path.join(directory, 'goods.json');
  const goodData = await fs.readFile(file, 'utf8');
  try {
    await fs.writeFile(file, '{broken');
    assert.equal((await request('/goods')).status, 500);
  } finally {
    await fs.writeFile(file, goodData);
  }
  await fs.mkdir(path.join(directory, 'orders.json.tmp'));
  assert.equal((await request('/orders', {cookie, body: valid})).status, 500);
  await fs.rmdir(path.join(directory, 'orders.json.tmp'));
  assert.equal((await request('/orders', {cookie, body: valid})).status, 201);
  assert.equal((await request('/api/goods')).status, 200);
});
test('Corrupt cart data is sanitized and quantities are bounded', async () => {
  const {normalizeCart} = await import('../../frontend/src/cart.js');
  assert.deepEqual(normalizeCart(null), []);
  assert.deepEqual(normalizeCart({id: 1, quantity: 5}), []);
  assert.deepEqual(
    normalizeCart([
      null,
      {id: 1, quantity: -1},
      {id: 2, quantity: 2},
      {id: 2, quantity: 98},
      {id: 3, quantity: '2'},
    ]),
    [{id: 2, quantity: 99}],
  );
});
