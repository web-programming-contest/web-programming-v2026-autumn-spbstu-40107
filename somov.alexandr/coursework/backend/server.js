import express from 'express';
import session from 'express-session';
import {randomBytes} from 'node:crypto';
import {readFile, writeFile, rename} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultDataDir = fileURLToPath(new URL('./data/', import.meta.url));

function validateOrder(body, goods) {
  const errors = {};
  if (typeof body.phone !== 'string' || !/^\+?[\d\s()\-]+$/.test(body.phone.trim()) || !/^\d{10,15}$/.test(body.phone.replace(/\D/g, ''))) {
    errors.phone = 'Введите номер телефона: от 10 до 15 цифр.';
  }
  if (body.email !== undefined && (typeof body.email !== 'string' || (body.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())))) {
    errors.email = 'Введите корректную почту.';
  }
  if (!['pickup', 'delivery'].includes(body.deliveryMethod)) errors.deliveryMethod = 'Выберите способ получения.';
  if (body.deliveryMethod === 'delivery' && (typeof body.address !== 'string' || !body.address.trim())) errors.address = 'Укажите адрес доставки.';
  if (!['card', 'cash'].includes(body.paymentMethod)) errors.paymentMethod = 'Выберите способ оплаты.';
  if (typeof body.needsPackaging !== 'boolean') errors.needsPackaging = 'Укажите, нужна ли упаковка.';

  if (!Array.isArray(body.items) || !body.items.length) {
    errors.items = 'Корзина пуста.';
  } else {
    const ids = new Set();
    for (const item of body.items) {
      if (!item || !Number.isInteger(item.productId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999 || ids.has(item.productId) || !goods.some((good) => good.id === item.productId)) {
        errors.items = 'Проверьте товары и количество в корзине (от 1 до 999).';
        break;
      }
      ids.add(item.productId);
    }
  }
  return errors;
}

export function createApp({dataDir = defaultDataDir} = {}) {
  const app = express();
  const readJson = async (name) => JSON.parse(await readFile(join(dataDir, name), 'utf8'));
  let orderQueue = Promise.resolve();

  async function readOrders() {
    try {
      return await readJson('orders.json');
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  app.disable('x-powered-by');
  app.use(express.json({limit: '64kb'}));
  app.use(session({
    name: 'gadget.sid',
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, sameSite: 'lax', secure: false, maxAge: 24 * 60 * 60 * 1000},
  }));

  app.get('/session', (req, res) => res.json({user: req.session.user || null}));

  app.post('/login', async (req, res) => {
    const {login, password} = req.body || {};
    const fieldErrors = {};
    if (typeof login !== 'string' || !login.trim()) fieldErrors.login = 'Заполните обязательное поле.';
    if (typeof password !== 'string' || !password.trim()) fieldErrors.password = 'Заполните обязательное поле.';
    if (Object.keys(fieldErrors).length) return res.status(400).json({message: 'Заполните обязательные поля.', fieldErrors});

    const users = await readJson('users.json');
    const user = users.find((item) => item.login === login.trim() && item.password === password);
    if (!user) return res.status(401).json({message: 'Такого пользователя нет, возможно неправильный логин или пароль — проверьте данные.'});

    await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
    req.session.user = {id: user.id, login: user.login};
    res.json({user: req.session.user});
  });

  app.post('/logout', async (req, res) => {
    await new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));
    res.clearCookie('gadget.sid');
    res.json({success: true});
  });

  app.get('/goods', async (req, res) => res.json(await readJson('goods.json')));

  function requireUser(req, res, next) {
    if (!req.session.user) return res.status(401).json({message: 'Войдите в аккаунт, чтобы продолжить.'});
    next();
  }

  app.get('/orders', requireUser, async (req, res) => {
    const orders = await readOrders();
    res.json(orders.filter((order) => order.userId === req.session.user.id).reverse());
  });

  app.post('/orders', requireUser, async (req, res) => {
    const body = req.body || {};
    const goods = await readJson('goods.json');
    const fieldErrors = validateOrder(body, goods);
    if (Object.keys(fieldErrors).length) return res.status(400).json({message: 'Проверьте данные заказа.', fieldErrors});

    const items = body.items.map((item) => {
      const good = goods.find((product) => product.id === item.productId);
      return {productId: good.id, name: good.name, image: good.image, price: good.price, quantity: item.quantity};
    });
    const userId = req.session.user.id;

    // Одна очередь и замена файла целиком предотвращают потерю параллельных заказов.
    const task = orderQueue.then(async () => {
      const orders = await readOrders();
      const order = {
        id: orders.reduce((max, item) => Math.max(max, item.id), 0) + 1,
        userId,
        createdAt: new Date().toISOString(),
        items,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        phone: body.phone.trim(),
        email: body.email?.trim() || '',
        deliveryMethod: body.deliveryMethod,
        address: body.deliveryMethod === 'delivery' ? body.address.trim() : '',
        paymentMethod: body.paymentMethod,
        needsPackaging: body.needsPackaging,
      };
      orders.push(order);
      await writeFile(join(dataDir, 'orders.tmp'), JSON.stringify(orders, null, 2) + '\n');
      await rename(join(dataDir, 'orders.tmp'), join(dataDir, 'orders.json'));
      return order;
    });
    orderQueue = task.catch(() => {});
    res.status(201).json(await task);
  });

  app.use((req, res) => res.status(404).json({message: 'Адрес API не найден.'}));
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({message: 'Неверный формат JSON.'});
    if (error.type === 'entity.too.large') return res.status(413).json({message: 'Слишком большой запрос.'});
    console.error(error.message);
    res.status(500).json({message: 'Не удалось выполнить запрос. Попробуйте ещё раз.'});
  });
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8080;
  createApp({dataDir: process.env.DATA_DIR || defaultDataDir}).listen(port, '127.0.0.1', () => console.log(`Gadget Hub API: http://127.0.0.1:${port}`));
}
