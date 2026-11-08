import express from 'express';
import cors from 'cors';
import {promises as fs} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const GOODS_FILE = path.join(DATA_DIR, 'goods.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function readJsonFile(filePath, defaultData = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultData;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

const handleLogin = async (req, res) => {
  try {
    const {login, username, password} = req.body;
    const userLogin = login || username;
    const users = await readJsonFile(USERS_FILE, []);

    const user = users.find(
      (u) =>
        (u.login === userLogin || u.username === userLogin) &&
        u.password === password,
    );

    if (!user) {
      return res.status(401).json({
        error:
          'Такого пользователя нет, возможно неправильный логин или пароль, проверьте данные',
      });
    }

    res.json({
      success: true,
      user: {id: user.id || 1, login: user.login || user.username},
    });
  } catch {
    res.status(500).json({error: 'Ошибка сервера при авторизации'});
  }
};

app.post('/login', handleLogin);
app.post('/api/login', handleLogin);

const handleLogout = (req, res) => {
  res.json({success: true});
};

app.post('/logout', handleLogout);
app.post('/api/logout', handleLogout);

const handleGetGoods = async (req, res) => {
  try {
    const goods = await readJsonFile(GOODS_FILE, []);
    res.json(goods);
  } catch {
    res.status(500).json({error: 'Ошибка чтения списка товаров'});
  }
};

app.get('/goods', handleGetGoods);
app.get('/api/goods', handleGetGoods);

const handleGetOrders = async (req, res) => {
  try {
    const orders = await readJsonFile(ORDERS_FILE, []);
    res.json(orders);
  } catch {
    res.status(500).json({error: 'Ошибка чтения заказов'});
  }
};

app.get('/orders', handleGetOrders);
app.get('/api/orders', handleGetOrders);

const handleCreateOrder = async (req, res) => {
  try {
    const orders = await readJsonFile(ORDERS_FILE, []);
    const {
      items = [],
      phone,
      email,
      deliveryType,
      address,
      paymentMethod,
      needPackaging,
      totalCount,
      totalPrice,
    } = req.body;

    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    const calcCount =
      totalCount !== undefined
        ? totalCount
        : items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const calcPrice =
      totalPrice !== undefined
        ? totalPrice
        : items.reduce(
            (sum, item) => sum + item.price * (item.quantity || 1),
            0,
          );

    const newOrder = {
      id: orderNumber,
      orderNumber,
      date: formattedDate,
      totalCount: calcCount,
      totalPrice: calcPrice,
      phone,
      email: email || '',
      deliveryType: deliveryType || 'pickup',
      address: deliveryType === 'delivery' ? address : '',
      paymentMethod: paymentMethod || 'card',
      needPackaging: Boolean(needPackaging),
      items,
    };

    orders.unshift(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);

    res.status(201).json(newOrder);
  } catch {
    res.status(500).json({error: 'Ошибка при сохранении заказа'});
  }
};

app.post('/orders', handleCreateOrder);
app.post('/api/orders', handleCreateOrder);

app.listen(PORT, () => {
  console.warn(`Backend server is running on http://localhost:${PORT}`);
});
