import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const GOODS_PATH = path.join(__dirname, 'data', 'goods.json');
const ORDERS_PATH = path.join(__dirname, 'data', 'orders.json');

// Единственный тестовый пользователь в системе (согласно ТЗ)
const VALID_USER = {
  username: 'admin',
  password: '123'
};

let activeSession = false;

// 1. POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === VALID_USER.username && password === VALID_USER.password) {
    activeSession = true;
    return res.json({ success: true, username: VALID_USER.username });
  }
  return res.status(401).json({
    success: false,
    message: 'такого пользователя нет, возможно неправильный логин или пароль проверьте данные'
  });
});

// 2. POST /logout
app.post('/logout', (req, res) => {
  activeSession = false;
  res.json({ success: true });
});

// 3. GET /goods
app.get('/goods', async (req, res) => {
  try {
    const raw = await fs.readFile(GOODS_PATH, 'utf-8');
    const goods = JSON.parse(raw);
    res.json(goods);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения списка товаров' });
  }
});

// 4. GET /orders
app.get('/orders', async (req, res) => {
  try {
    const raw = await fs.readFile(ORDERS_PATH, 'utf-8');
    const orders = JSON.parse(raw);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения заказов' });
  }
});

// 5. POST /orders
app.post('/orders', async (req, res) => {
  try {
    const { items, customer } = req.body;
    const raw = await fs.readFile(ORDERS_PATH, 'utf-8');
    const orders = JSON.parse(raw);

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('ru-RU');
    const orderId = Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: orderId,
      date: formattedDate,
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