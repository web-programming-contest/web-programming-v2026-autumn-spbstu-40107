const express = require('express');
const session = require('express-session');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

app.use(
  session({
    secret: 'secret-key-gadget',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
  }),
);

const DATA_DIR = path.join(__dirname, 'data');

const readDb = async (filename) => {
  const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
  return JSON.parse(data);
};
const writeDb = async (filename, data) => {
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
  );
};

app.post('/login', async (req, res) => {
  const users = await readDb('users.json');
  const user = users.find(
    (u) => u.username === req.body.username && u.password === req.body.password,
  );

  if (user) {
    req.session.user = user.username;
    res.json({success: true, username: user.username});
  } else {
    res.status(401).json({success: false});
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({success: true});
});

app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({isAuth: true});
  } else {
    res.json({isAuth: false});
  }
});

app.get('/goods', async (req, res) => {
  const products = await readDb('products.json');
  res.json(products);
});

app.get('/orders', async (req, res) => {
  const orders = await readDb('orders.json');
  res.json(orders);
});

app.post('/orders', async (req, res) => {
  const orders = await readDb('orders.json');
  const newOrder = {
    id: Date.now(),
    date: new Date().toLocaleDateString('ru-RU'),
    items: req.body.items,
    total: req.body.total,
  };
  orders.push(newOrder);
  await writeDb('orders.json', orders);
  res.json({success: true, orderId: newOrder.id});
});

app.listen(8080, () => {
  console.log('Бекенд запущен на http://localhost:8080');
});
