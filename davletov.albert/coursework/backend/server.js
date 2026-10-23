const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const PORT = 8080;
const FRONTEND_URL = 'http://localhost:3000';
const GOODS_FILE = path.join(__dirname, 'data', 'goods.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const writeJson = (file, data) => fs.writeFile(file, JSON.stringify(data, null, 2));

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
  next();
};

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'gadget-hub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));

app.get('/goods', async (req, res) => {
  const text = await fs.readFile(GOODS_FILE, 'utf8');
  res.json(JSON.parse(text));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Заполните обязательные поля' });
  }

  const users = await readJson(USERS_FILE);
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({
      message: 'Такого пользователя нет, возможно неправильный логин или пароль - проверьте данные',
    });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, username: user.username });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
  const users = await readJson(USERS_FILE);
  const user = users.find((u) => u.id === req.session.userId);
  res.json({ id: user.id, username: user.username });
});

app.get('/orders', requireAuth, async (req, res) => {
  const orders = await readJson(ORDERS_FILE);
  res.json(orders.filter((o) => o.userId === req.session.userId));
});

app.post('/orders', requireAuth, async (req, res) => {
  const { items, email, phone, delivery, address, payment, packaging } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Корзина пуста' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: 'Укажите номер телефона' });
  }
  if (phone.replace(/\D/g, '').length !== 11) {
    return res.status(400).json({ message: 'Некорректный номер телефона' });
  }
  if (delivery !== 'pickup' && delivery !== 'delivery') {
    return res.status(400).json({ message: 'Выберите самовывоз или доставку' });
  }
  if (delivery === 'delivery' && (!address || !address.trim())) {
    return res.status(400).json({ message: 'Укажите адрес доставки' });
  }
  if (payment !== 'card' && payment !== 'cash') {
    return res.status(400).json({ message: 'Выберите способ оплаты' });
  }

  const goods = await readJson(GOODS_FILE);
  const orderItems = [];
  for (const item of items) {
    const product = goods.find((g) => g.id === item.id);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ message: 'В заказе некорректный товар' });
    }
    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const orders = await readJson(ORDERS_FILE);
  const order = {
    id: orders.length + 1,
    userId: req.session.userId,
    date: new Date().toISOString(),
    email: email ?? '',
    phone: phone.trim(),
    delivery,
    address: delivery === 'delivery' ? address.trim() : '',
    payment,
    packaging: Boolean(packaging),
    items: orderItems,
    count: orderItems.reduce((sum, i) => sum + i.quantity, 0),
    total: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };

  orders.push(order);
  await writeJson(ORDERS_FILE, orders);
  res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
