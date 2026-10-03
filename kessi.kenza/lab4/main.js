import {Product} from './model.js';

const STORAGE_KEY = 'products';
const ASYNC_DELAY = 300;

const entityList = document.querySelector('[data-testid="entity-list"]');
const entityForm = document.querySelector('[data-testid="entity-form"]');

function loadProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [
      new Product(1, 'Ноутбук', ['Электроника'], 50000),
      new Product(2, 'Кофе', ['Продукты'], 500),
    ];
  }
  return JSON.parse(raw).map(
    (data) => new Product(data.id, data.name, data.categories, data.price),
  );
}

let products = loadProducts();

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function runAsync(action) {
  return new Promise((resolve) => {
    setTimeout(() => {
      action();
      resolve();
    }, ASYNC_DELAY);
  });
}

function addProductAsync(product) {
  return runAsync(() => {
    products.push(product);
    saveProducts();
    render();
  });
}

function deleteProductAsync(id) {
  return runAsync(() => {
    products = products.filter((product) => product.id !== id);
    saveProducts();
    render();
  });
}

function addCategoryAsync(id, category) {
  return runAsync(() => {
    const product = products.find((item) => item.id === id);
    if (product) {
      product.addCategory(category);
      saveProducts();
      render();
    }
  });
}

function removeCategoryAsync(id, category) {
  return runAsync(() => {
    const product = products.find((item) => item.id === id);
    if (product) {
      product.removeCategory(category);
      saveProducts();
      render();
    }
  });
}

function render() {
  entityList.innerHTML = '';
  for (const product of products) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.testid = 'entity-card';
    card.innerHTML = `
      <h2 class="card__name">${product.name}</h2>
      <p class="card__price">Цена: ${product.price}</p>
      <p class="card__meta">Категорий: ${product.categoryCount}</p>
      <div class="card__tags">
        ${product.categories
          .map(
            (category) => `
              <span class="chip">
                ${category}
                <button
                  class="btn btn--small"
                  type="button"
                  data-remove-category
                  data-id="${product.id}"
                  data-category="${category}"
                >
                  Удалить категорию
                </button>
              </span>`,
          )
          .join('')}
      </div>
      <form class="card__category-form" data-id="${product.id}">
        <label>
          Новая категория
          <input name="category" type="text" required />
        </label>
        <button class="btn" type="submit">Добавить категорию</button>
      </form>
      <button
        class="btn btn--danger"
        type="button"
        data-testid="delete-entity"
        data-id="${product.id}"
      >
        Удалить товар
      </button>
    `;
    entityList.appendChild(card);
  }
}

entityForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(entityForm);
  const id = Number(formData.get('id'));
  const name = String(formData.get('name')).trim();
  const price = Number(formData.get('price'));
  if (!id || !name || Number.isNaN(price)) {
    return;
  }
  if (products.some((product) => product.id === id)) {
    return;
  }
  entityForm.reset();
  addProductAsync(new Product(id, name, [], price));
});

entityList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-testid="delete-entity"]');
  if (deleteButton) {
    deleteProductAsync(Number(deleteButton.dataset.id));
    return;
  }
  const categoryButton = event.target.closest('[data-remove-category]');
  if (categoryButton) {
    removeCategoryAsync(
      Number(categoryButton.dataset.id),
      categoryButton.dataset.category,
    );
  }
});

entityList.addEventListener('submit', (event) => {
  const form = event.target.closest('.card__category-form');
  if (!form) {
    return;
  }
  event.preventDefault();
  const input = form.elements.category;
  const category = input.value.trim();
  if (category) {
    addCategoryAsync(Number(form.dataset.id), category);
  }
  form.reset();
});

saveProducts();
render();
