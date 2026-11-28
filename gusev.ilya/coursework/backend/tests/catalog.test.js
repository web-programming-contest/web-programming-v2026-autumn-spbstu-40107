const {test} = require('node:test');
const assert = require('node:assert/strict');
const logic = import('../../frontend/src/catalog.js');
const goods = [
  {
    id: 1,
    type: 'phone',
    color: 'black',
    price: 40,
    popularity: 5,
    isNew: false,
  },
  {
    id: 2,
    type: 'watch',
    color: 'white',
    price: 10,
    popularity: 50,
    isNew: true,
  },
  {
    id: 3,
    type: 'phone',
    color: 'white',
    price: 30,
    popularity: 20,
    isNew: true,
  },
  {
    id: 4,
    type: 'watch',
    color: 'black',
    price: 20,
    popularity: 80,
    isNew: false,
  },
];
const filters = {
  min: '',
  max: '',
  types: ['phone', 'watch'],
  colors: ['black', 'white'],
};
const ids = (items) => items.map((item) => item.id);

test('Unchecked filter group means all options, with other filters still applied', async () => {
  const {filterGoods} = await logic;
  assert.deepEqual(
    filterGoods(goods, {...filters, types: [], colors: []}),
    goods,
  );
  assert.deepEqual(
    ids(filterGoods(goods, {...filters, types: [], colors: ['white']})),
    [2, 3],
  );
  assert.deepEqual(
    ids(filterGoods(goods, {...filters, types: ['phone'], colors: []})),
    [1, 3],
  );
});
test('Price bounds apply when all type and color checkboxes are unchecked', async () => {
  const {filterGoods} = await logic;
  const empty = {...filters, types: [], colors: []};
  assert.deepEqual(
    ids(filterGoods(goods, {...empty, min: '20', max: '30'})),
    [3, 4],
  );
  assert.deepEqual(filterGoods(goods, {...empty, max: '0'}), []);
  assert.deepEqual(filterGoods(goods, {...empty, min: '100'}), []);
  assert.deepEqual(filterGoods(goods, empty), goods);
});
test('Price, popularity and newness support both sorting directions without mutating data', async () => {
  const {sortGoods} = await logic;
  assert.deepEqual(ids(sortGoods(goods, 'price', 'asc')), [2, 4, 3, 1]);
  assert.deepEqual(ids(sortGoods(goods, 'price', 'desc')), [1, 3, 4, 2]);
  assert.deepEqual(ids(sortGoods(goods, 'popular', 'asc')), [1, 3, 2, 4]);
  assert.deepEqual(ids(sortGoods(goods, 'popular', 'desc')), [4, 2, 3, 1]);
  assert.deepEqual(ids(sortGoods(goods, 'new', 'desc')), [2, 3, 1, 4]);
  assert.deepEqual(ids(sortGoods(goods, 'new', 'asc')), [1, 4, 2, 3]);
  assert.deepEqual(ids(goods), [1, 2, 3, 4]);
});
test('More than three pages always use the required 1 2 3 … N pattern', async () => {
  const {pageNumbers} = await logic;
  assert.deepEqual(pageNumbers(0), []);
  assert.deepEqual(pageNumbers(1), [1]);
  assert.deepEqual(pageNumbers(3), [1, 2, 3]);
  assert.deepEqual(pageNumbers(4), [1, 2, 3, '…', 4]);
  assert.deepEqual(pageNumbers(5), [1, 2, 3, '…', 5]);
  assert.deepEqual(pageNumbers(20), [1, 2, 3, '…', 20]);
});
