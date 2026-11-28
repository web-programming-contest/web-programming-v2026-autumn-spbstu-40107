const express = require('express');
const session = require('express-session');
const fs = require('node:fs/promises');
const path = require('node:path');
const {randomBytes} = require('node:crypto');

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const text = (value) => (typeof value === 'string' ? value.trim() : '');

function createApp({
  dataDir = process.env.DATA_DIR || path.join(__dirname, 'data'),
  secret = process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({limit: '64kb'}));
  app.use(
    session({
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: {httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000},
    }),
  );
  const readJson = async (name) =>
    JSON.parse(await fs.readFile(path.join(dataDir, name), 'utf8'));

  let queue = Promise.resolve();
  const updateOrders = (fn) => {
    const operation = queue.then(async () => {
      const orders = await readJson('orders.json');
      const result = fn(orders);
      if (result.created) {
        const destination = path.join(dataDir, 'orders.json');
        await fs.writeFile(
          `${destination}.tmp`,
          `${JSON.stringify(orders, null, 2)}\n`,
        );
        await fs.rename(`${destination}.tmp`, destination);
      }
      return result;
    });
    queue = operation.catch(() => {});
    return operation;
  };
  const auth = (req, res, next) =>
    req.session.userId
      ? next()
      : res.status(401).json({message: 'Войдите в аккаунт, чтобы продолжить'});
  const {Router: createRouter} = express;
  const router = createRouter();
  router.post(
    '/login',
    asyncRoute(async (req, res) => {
      const username = text(req.body?.username);
      const password = req.body?.password;
      if (
        !username ||
        typeof password !== 'string' ||
        !password ||
        username.length > 100 ||
        password.length > 200
      ) {
        return res.status(400).json({message: 'Заполните логин и пароль'});
      }
      const users = await readJson('users.json');
      const user = users.find(
        (u) => u.username === username && u.password === password,
      );
      if (!user) {
        return res.status(401).json({
          message:
            'Такого пользователя нет, возможно неправильный логин или пароль - проверьте данные',
        });
      }
      await new Promise((resolve, reject) =>
        req.session.regenerate((err) => (err ? reject(err) : resolve())),
      );
      req.session.userId = user.id;
      await new Promise((resolve, reject) =>
        req.session.save((err) => (err ? reject(err) : resolve())),
      );
      res.json({id: user.id, username: user.username});
    }),
  );
  router.post('/logout', (req, res, next) =>
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid', {httpOnly: true, sameSite: 'lax'});
      res.json({ok: true});
    }),
  );
  router.get(
    '/me',
    auth,
    asyncRoute(async (req, res) => {
      const user = (await readJson('users.json')).find(
        (u) => u.id === req.session.userId,
      );
      if (!user) {
        return res.status(401).json({message: 'Пользователь не найден'});
      }
      res.json({id: user.id, username: user.username});
    }),
  );
  router.get(
    '/goods',
    asyncRoute(async (req, res) => res.json(await readJson('goods.json'))),
  );
  router.get(
    '/orders',
    auth,
    asyncRoute(async (req, res) => {
      const orders = await readJson('orders.json');
      res.json(
        orders.filter((order) => order.userId === req.session.userId).reverse(),
      );
    }),
  );
  router.post(
    '/orders',
    auth,
    asyncRoute(async (req, res) => {
      const body = req.body || {};
      const {items, delivery, payment, packaging, clientRequestId} = body;
      const phone = text(body.phone);
      const email = text(body.email);
      const address = text(body.address);
      const errors = {};
      if (!Array.isArray(items) || items.length < 1 || items.length > 100) {
        errors.items = 'Добавьте товары в корзину';
      }
      if (
        !/^[+\d\s()-]+$/.test(phone) ||
        !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))
      ) {
        errors.phone = 'Введите корректный номер телефона';
      }
      if (
        email &&
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      ) {
        errors.email = 'Введите корректный e-mail';
      }
      if (!['pickup', 'delivery'].includes(delivery)) {
        errors.delivery = 'Выберите способ получения';
      }
      if (
        delivery === 'delivery' &&
        (address.length < 5 || address.length > 500)
      ) {
        errors.address = 'Укажите адрес доставки (от 5 до 500 символов)';
      }
      if (!['card', 'cash'].includes(payment)) {
        errors.payment = 'Выберите способ оплаты';
      }
      if (packaging !== undefined && typeof packaging !== 'boolean') {
        errors.packaging = 'Некорректная упаковка';
      }
      if (
        clientRequestId !== undefined &&
        (typeof clientRequestId !== 'string' ||
          !/^[\w-]{8,80}$/.test(clientRequestId))
      ) {
        errors.request = 'Некорректный идентификатор запроса';
      }
      if (Object.keys(errors).length) {
        return res.status(400).json({message: 'Проверьте поля заказа', errors});
      }
      const goods = await readJson('goods.json');
      const seen = new Set();
      const orderItems = [];
      for (const item of items) {
        const good = item && goods.find((g) => g.id === item.id);
        if (
          !good ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 99 ||
          seen.has(item.id)
        ) {
          return res
            .status(400)
            .json({message: 'Некорректный товар или количество (от 1 до 99)'});
        }
        seen.add(item.id);
        orderItems.push({
          id: good.id,
          name: good.name,
          image: good.image,
          price: good.price,
          quantity: item.quantity,
        });
      }
      const userId = req.session.userId;
      const result = await updateOrders((orders) => {
        const existing =
          clientRequestId &&
          orders.find(
            (o) => o.userId === userId && o.clientRequestId === clientRequestId,
          );
        if (existing) {
          return {created: false, order: existing};
        }
        const order = {
          id: orders.reduce((max, o) => Math.max(max, o.id), 0) + 1,
          number: orders.filter((o) => o.userId === userId).length + 1,
          userId,
          date: new Date().toISOString(),
          phone,
          email,
          delivery,
          address: delivery === 'delivery' ? address : '',
          payment,
          packaging: Boolean(packaging),
          items: orderItems,
          count: orderItems.reduce((sum, i) => sum + i.quantity, 0),
          total: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          ...(clientRequestId ? {clientRequestId} : {}),
        };
        orders.push(order);
        return {created: true, order};
      });
      res.status(result.created ? 201 : 200).json(result.order);
    }),
  );
  app.use(['/api', '/'], router);
  app.use('/api', (req, res) =>
    res.status(404).json({message: 'Метод API не найден'}),
  );
  const build = path.join(__dirname, '../frontend/dist');
  app.use(express.static(build));
  app.get(['/', '/login', '/catalog', '/cart'], (req, res, next) =>
    res.sendFile(path.join(build, 'index.html'), (err) => err && next(err)),
  );
  app.use((req, res) => res.status(404).json({message: 'Страница не найдена'}));
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status === 400 || err.status === 413 ? err.status : 500;
    if (status === 500) {
      console.error(err.message);
    }
    res.status(status).json({
      message:
        status === 500
          ? 'Не удалось обработать запрос. Попробуйте ещё раз.'
          : 'Некорректный запрос',
    });
  });
  return app;
}
if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  createApp().listen(port, '127.0.0.1', () =>
    process.stdout.write(`Gadget Hub: http://localhost:${port}\n`),
  );
}
module.exports = {createApp};
