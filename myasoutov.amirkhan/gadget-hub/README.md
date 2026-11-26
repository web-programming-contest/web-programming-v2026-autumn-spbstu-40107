# Gadget Hub

Курсовой проект — интернет-магазин гаджетов. Клиент на React + Vite, сервер на Express.
Фронтенд и бэкенд запускаются на разных портах.

## Структура

```
gadget-hub/
├── backend/
│   ├── data/
│   │   ├── goods.json      # 32 товара с описанием, характеристиками и картинками
│   │   ├── users.json      # пользователи
│   │   └── orders.json     # заказы (с полем username)
│   ├── package.json
│   └── server.js           # API, сессии, защита заказов
└── frontend/
    ├── public/
    │   ├── fonts/          # локальный Rubik (4 начертания)
    │   ├── goods/          # изображения товаров + placeholder.svg
    │   ├── icons/          # локальные иконки
    │   └── social icons/   # иконки соцсетей
    ├── src/
    │   ├── components/
    │   │   ├── Modals.jsx      # модалки товара, ошибки, удаления, успеха
    │   │   └── ProductCard.jsx # карточка товара
    │   ├── context/
    │   │   └── AppContext.jsx  # сессия, корзина, каталог, заказы, фильтры
    │   ├── pages/
    │   │   ├── Home.jsx        # главная: баннер, хиты, новинки, преимущества, контакты
    │   │   ├── Login.jsx       # авторизация
    │   │   ├── Catalog.jsx     # каталог: сортировка, фильтры, пагинация
    │   │   └── Cart.jsx        # корзина, оформление заказа, история заказов
    │   ├── App.jsx             # React Router, шапка, подвал, ProtectedRoute
    │   ├── constants.js
    │   ├── main.jsx
    │   └── styles.css
    ├── eslint.config.js
    └── package.json
```

## Запуск

Терминал 1 — бэкенд (порт 8080):

```bash
cd backend
npm install
npm start
```

Терминал 2 — фронтенд (порт 3000):

```bash
cd frontend
npm install
npm run dev
```

Открыть http://localhost:3000

## Тестовые аккаунты

| Логин  | Пароль |
| ------ | ------ |
| admin  | 123    |
| user1  | 123    |
| user2  | 123    |

У каждого пользователя своя корзина (`gadget_hub_cart_<username>` в `localStorage`)
и своя история заказов. Сессия хранится в `gadget_hub_session` и проверяется на сервере.

## API

| Метод  | Путь       | Описание                                    | Авторизация |
| ------ | ---------- | ------------------------------------------- | ----------- |
| `POST` | `/login`   | Вход, возвращает токен                      | нет         |
| `POST` | `/logout`  | Выход, удаляет токен                        | Bearer      |
| `GET`  | `/me`      | Проверка сессии                             | Bearer      |
| `GET`  | `/goods`   | Список товаров                              | нет         |
| `GET`  | `/orders`  | Заказы текущего пользователя                | Bearer      |
| `POST` | `/orders`  | Оформление заказа выбранных товаров         | Bearer      |

## Скрипты фронтенда

- `npm run dev` — локальный сервер разработки
- `npm run build` — production-сборка
- `npm run lint` — проверка ESLint
