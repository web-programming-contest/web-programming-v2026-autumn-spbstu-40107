import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const GOODS_PATH = path.join(__dirname, 'data', 'goods.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

const USERS = JSON.parse(readFileSync(USERS_PATH, 'utf-8'));

// token -> username. Сессии живут до перезапуска сервера или выхода пользователя.
const sessions = new Map();

const getToken = (req) => {
  const header = req.get('Authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
};

const requireAuth = (req, res, next) => {
  const token = getToken(req);
  const username = token ? sessions.get(token) : null;

  if (!username) {
    return res.status(401).json({
      success: false,
      message: 'Необходимо войти в систему'
    });
  }

  req.user = { username };
  req.sessionToken = token;
  next();
};

const normalizeOrders = (orders) =>
  orders.map((order) => ({
    ...order,
    // Старые заказы в файле считаем заказами администратора.
    username: order.username || 'admin'
  }));

// 1. POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message:
        'такого пользователя нет, возможно неправильный логин или пароль - проверьте данные'
    });
  }

  const token = randomBytes(24).toString('hex');
  sessions.set(token, user.username);

  return res.json({ success: true, username: user.username, token });
});

// 2. POST /logout
app.post('/logout', (req, res) => {
  const token = getToken(req);
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

// Дополнительный эндпоинт для проверки сохранённой сессии при загрузке страницы
app.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, username: req.user.username });
});

// 3. GET /goods — доступен гостю, потому что хиты и новинки видны на главной
app.get('/goods', async (req, res) => {
  try {
    const raw = await fs.readFile(GOODS_PATH, 'utf-8');
    const goods = JSON.parse(raw);
    res.json(goods);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения списка товаров' });
  }
});

// 4. GET /orders — только свои заказы
app.get('/orders', requireAuth, async (req, res) => {
  try {
    const raw = await fs.readFile(ORDERS_PATH, 'utf-8');
    const orders = normalizeOrders(JSON.parse(raw));
    res.json(orders.filter((order) => order.username === req.user.username));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения заказов' });
  }
});

// 5. POST /orders — заказ сохраняется за текущим пользователем
app.post('/orders', requireAuth, async (req, res) => {
  try {
    const { items, customer } = req.body;
    const raw = await fs.readFile(ORDERS_PATH, 'utf-8');
    const orders = normalizeOrders(JSON.parse(raw));

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('ru-RU');
    const orderId = Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: orderId,
      date: formattedDate,
      username: req.user.username,
      totalCount,
      totalPrice,
      customer,
      items
    };

    orders.unshift(newOrder);
    await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
