import {
  ClothingItem,
  groupItemsBySize,
  getUniqueColors,
  findItemsByColor,
  groupItemsByColorCount,
  findItemsAboveColorCount,
  type Size,
} from './model.js';

const storageKey = 'lab4-clothing-items';
const itemForm = document.querySelector<HTMLFormElement>('#item-form')!;
const list = document.querySelector<HTMLElement>('#items')!;
const template = document.querySelector<HTMLTemplateElement>('#item-card')!;
const colorFilter = document.querySelector<HTMLSelectElement>('#color-filter')!;
const countFilter = document.querySelector<HTMLInputElement>('#count-filter')!;
const grouping = document.querySelector<HTMLSelectElement>('#grouping')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;

let items = loadItems();

function loadItems() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const data = JSON.parse(saved) as ClothingItem[];

      return data.map(
        (item) => new ClothingItem(item.id, item.name, item.size, item.colors),
      );
    }
  } catch {
    status.textContent = 'Не удалось загрузить сохранённые товары.';
  }

  return [
    new ClothingItem(1, 'Льняная рубашка', 'M', ['белый', 'песочный']),
    new ClothingItem(2, 'Базовая футболка', 'S', [
      'белый',
      'чёрный',
      'зелёный',
    ]),
    new ClothingItem(3, 'Тёплый свитер', 'L', ['серый']),
    new ClothingItem(4, 'Свободный худи', 'XL', ['чёрный', 'серый']),
  ];
}

async function updateItems(change: () => ClothingItem[]) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 150);
  });

  try {
    const updated = change();
    localStorage.setItem(storageKey, JSON.stringify(updated));
    items = updated;
    status.textContent = '';
    render();
  } catch (error) {
    status.textContent =
      error instanceof Error
        ? error.message
        : 'Не удалось сохранить изменения.';

    return false;
  }

  return true;
}

function changeColor(id: number, change: (item: ClothingItem) => void) {
  return updateItems(() => {
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem) {
      throw new Error('Товар уже удалён.');
    }

    const updated = new ClothingItem(
      currentItem.id,
      currentItem.name,
      currentItem.size,
      currentItem.colors,
    );
    change(updated);

    return items.map((item) => (item.id === id ? updated : item));
  });
}

function addCard(item: ClothingItem) {
  const card = template.content.firstElementChild!.cloneNode(
    true,
  ) as HTMLElement;
  card.querySelector('h3')!.textContent = item.name;
  card.querySelector('.details')!.textContent =
    `ID: ${item.id}, размер: ${item.size}`;
  card.querySelector('.color-count')!.textContent =
    `Количество цветов: ${item.colorsCount}`;
  const colors = card.querySelector('ul')!;

  for (const color of item.colors) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    row.textContent = color;
    button.type = 'button';
    button.textContent = 'Удалить цвет';
    button.setAttribute('aria-label', `Удалить цвет ${color}`);
    button.addEventListener('click', () => {
      void changeColor(item.id, (updated) => updated.removeColor(color));
    });
    row.append(button);
    colors.append(row);
  }

  const form = card.querySelector('form')!;
  const input = form.querySelector('input')!;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const color = input.value.trim();
    if (!color) {
      status.textContent = 'Введите название цвета.';

      return;
    }

    void changeColor(item.id, (updated) => {
      if (updated.colors.includes(color)) {
        throw new Error('Этот цвет уже добавлен.');
      }
      updated.addColor(color);
    });
  });

  card
    .querySelector('[data-testid="delete-entity"]')!
    .addEventListener('click', () => {
      void updateItems(() =>
        items.filter((itemToKeep) => itemToKeep.id !== item.id),
      );
    });
  list.append(card);
}

function render() {
  const selectedColor = colorFilter.value;
  const colors = getUniqueColors(items);
  colorFilter.replaceChildren(new Option('Все цвета', ''));
  for (const color of colors) {
    colorFilter.add(new Option(color, color));
  }
  if (colors.includes(selectedColor)) {
    colorFilter.value = selectedColor;
  }

  let shown = items;
  if (colorFilter.value) {
    shown = findItemsByColor(shown, colorFilter.value);
  }
  if (countFilter.value && countFilter.validity.valid) {
    shown = findItemsAboveColorCount(shown, countFilter.valueAsNumber);
  }

  list.replaceChildren();
  if (shown.length === 0) {
    list.textContent = items.length
      ? 'Нет товаров по выбранным фильтрам.'
      : 'Список товаров пуст.';

    return;
  }

  if (!grouping.value) {
    shown.forEach(addCard);

    return;
  }

  const groups =
    grouping.value === 'size'
      ? groupItemsBySize(shown)
      : groupItemsByColorCount(shown);
  for (const [key, group] of Object.entries(groups)) {
    const heading = document.createElement('h3');
    heading.textContent =
      grouping.value === 'size' ? `Размер ${key}` : `Количество цветов: ${key}`;
    list.append(heading);
    group.forEach(addCard);
  }
}

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(itemForm);
  const id = Number(data.get('id'));
  const name = String(data.get('name')).trim();
  const size = data.get('size') as Size;
  if (!Number.isSafeInteger(id) || id < 1 || !name) {
    status.textContent = 'Введите положительный целый ID и название товара.';

    return;
  }

  const added = await updateItems(() => {
    if (items.some((item) => item.id === id)) {
      throw new Error('Товар с таким ID уже есть.');
    }

    return [...items, new ClothingItem(id, name, size)];
  });
  if (added) {
    itemForm.reset();
  }
});

colorFilter.addEventListener('change', render);
countFilter.addEventListener('input', render);
grouping.addEventListener('change', render);
render();
