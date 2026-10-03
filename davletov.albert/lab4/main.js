import {Library} from './model.js';

// Реализуйте асинхронную логику UI и синхронизацию с localStorage.
function save() {
  const text = JSON.stringify(libs);
  localStorage.setItem('libs', text);
}

function load() {
  const text = localStorage.getItem('libs');

  if (text === null) {
    return [new Library('Основная', [])];
  }

  return JSON.parse(text).map((obj) => new Library(obj.name, obj.books));
}

const libs = load();

const list = document.querySelector('[data-testid="entity-list"]');

function render() {
  list.innerHTML = '';
  const libSelector = document.querySelector('[name="libraryName"]');
  libSelector.innerHTML = '';

  for (const lib of libs) {
    const block = document.createElement('section');
    block.className = 'library';
    block.setAttribute('data-testid', 'entity-card');

    block.innerHTML = `
        <h2>${lib.name}</h2>
        <button type="button" data-testid="delete-entity">Удалить библиотеку</button>
        `;

    for (const book of lib.books) {
      const card = document.createElement('article');
      card.className = 'book-card';
      card.innerHTML = `
            <h3>${book.title}</h3>
            <p>Автор: ${book.author}</p>
            <p>Год: ${book.year}</p>
            <p>Жанр: ${book.genre}</p>
            <button type="button" data-testid="delete-book">Удалить</button>
            `;
      block.append(card);

      const elem = card.querySelector('[data-testid="delete-book"]');

      elem.addEventListener('click', () => {
        removeBook(book.title, lib);
      });
    }

    const option = document.createElement('option');
    option.textContent = lib.name;
    option.value = lib.name;
    libSelector.append(option);

    const libElem = block.querySelector('[data-testid="delete-entity"]');

    libElem.addEventListener('click', () => {
      removeLib(lib);
    });

    list.append(block);
  }
}

render();

function addBook(book, lib) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const obj = libs.find((l) => l.name === lib);
      obj.addBook(book);
      save();
      render();
      resolve();
    }, 300);
  });
}

function addLib(name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      libs.push(new Library(name, []));
      save();
      render();
      resolve();
    }, 300);
  });
}

const libForm = document.querySelector('[data-testid="entity-form"]');

libForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(libForm);
  const name = data.get('name').trim();

  addLib(name);

  libForm.reset();
});

function removeLib(lib) {
  if (libs.length === 1) {
    return;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = libs.indexOf(lib);
      libs.splice(index, 1);
      save();
      render();
      resolve();
    }, 300);
  });
}

function removeBook(title, lib) {
  return new Promise((resolve) => {
    setTimeout(() => {
      lib.removeBook(title);
      render();
      save();
      resolve();
    }, 300);
  });
}

const form = document.querySelector('[data-testid="book-form"]');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const book = {
    title: data.get('title'),
    author: data.get('author'),
    year: Number(data.get('year')),
    genre: data.get('genre'),
  };

  const lib = data.get('libraryName');

  addBook(book, lib);
  form.reset();
});
