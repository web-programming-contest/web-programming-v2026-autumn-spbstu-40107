import {Recipe} from './model.js';

const STORAGE_KEY = 'recipes';
const DELAY_MS = 50;

const form = document.querySelector('form[data-testid="entity-form"]');
const list = document.querySelector('[data-testid="entity-list"]');

let recipes = loadRecipes();

function loadRecipes() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === null) {
    return [];
  }

  try {
    return JSON.parse(saved).map(
      (item) => new Recipe(item.title, item.ingredients, item.steps),
    );
  } catch {
    return [];
  }
}

function saveRecipes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function runAsync(action) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        action();
        resolve();
      } catch (error) {
        reject(error);
      }
    }, DELAY_MS);
  })
    .then(() => {
      saveRecipes();
      render();
    })
    .catch((error) => {
      console.error(error);
    });
}

function splitItems(text) {
  return String(text ?? '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function createText(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function createButton(text, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function createAddRow(placeholder, buttonText, onAdd) {
  const row = document.createElement('div');
  row.className = 'add-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);

  const button = createButton(buttonText, () => {
    const value = input.value.trim();

    if (value !== '') {
      onAdd(value);
    }
  });

  row.append(input, button);
  return row;
}

function createIngredientList(recipe) {
  const items = document.createElement('ul');

  for (const ingredient of recipe.ingredients) {
    const item = createText('li', ingredient);

    const removeButton = createButton('Удалить ингредиент', () => {
      runAsync(() => recipe.removeIngredient(ingredient));
    });

    item.append(removeButton);
    items.append(item);
  }

  return items;
}

function createStepList(recipe) {
  const items = document.createElement('ol');

  recipe.steps.forEach((step, index) => {
    const item = createText('li', step);

    const removeButton = createButton('Удалить шаг', () => {
      runAsync(() => recipe.removeStep(index));
    });

    item.append(removeButton);
    items.append(item);
  });

  return items;
}

function createCard(recipe) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.testid = 'entity-card';

  const deleteButton = createButton('Удалить рецепт', () => {
    runAsync(() => {
      recipes = recipes.filter((item) => item !== recipe);
    });
  });
  deleteButton.dataset.testid = 'delete-entity';

  const addIngredientRow = createAddRow(
    'Новый ингредиент',
    'Добавить ингредиент',
    (value) => runAsync(() => recipe.addIngredient(value)),
  );

  const addStepRow = createAddRow('Новый шаг', 'Добавить шаг', (value) =>
    runAsync(() => recipe.addStep(value)),
  );

  card.append(
    createText('h2', recipe.title),
    createText('p', `Ингредиентов: ${recipe.ingredientCount}`),
    createText('p', `Шагов: ${recipe.stepCount}`),
    createText('h3', 'Ингредиенты'),
    createIngredientList(recipe),
    addIngredientRow,
    createText('h3', 'Шаги приготовления'),
    createStepList(recipe),
    addStepRow,
    deleteButton,
  );

  return card;
}

function render() {
  list.replaceChildren(...recipes.map((recipe) => createCard(recipe)));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const title = String(data.get('title') ?? '').trim();

  if (title === '') {
    return;
  }

  const ingredients = splitItems(data.get('ingredients'));
  const steps = splitItems(data.get('steps'));

  form.reset();
  runAsync(() => {
    recipes.push(new Recipe(title, ingredients, steps));
  });
});

render();
