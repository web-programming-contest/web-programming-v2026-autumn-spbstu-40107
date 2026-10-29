import {Movie} from './model.js';

const initialMovies = [
  new Movie('hunger games', 'Gary Ross', [
    'Jennifer Lawrence',
    'Josh Hutcherson',
    'Woody Harrelson',
    'Lenny Kravitz',
  ]),
  new Movie('twilight', 'Catherine Hardwicke', [
    'Kristen Stewart',
    'Robert Pattinson',
    'Taylor Lautner',
  ]),
  new Movie('pleasantville', 'Gary Ross', [
    'Tobey Maguire',
    'Reese Witherspoon',
    'William H. Macy',
    'Joan Allen',
    'Jeff Daniels',
  ]),
  new Movie('water for elephants', 'Francis Lawrence', [
    'Reese Witherspoon',
    'Robert Pattinson',
    'Christoph Waltz',
  ]),
];

const form = document.querySelector('[data-testid="entity-form"]');
const list = document.querySelector('[data-testid="entity-list"]');

function loadMovies() {
  const saved = localStorage.getItem('movies');

  if (saved === null) {
    return initialMovies;
  }

  const data = JSON.parse(saved);
  return data.map((item) => new Movie(item.title, item.director, item.actors));
}

function saveMovies() {
  const data = movieList.map((item) => item.profile);
  localStorage.setItem('movies', JSON.stringify(data));
}

let movieList = loadMovies();

function runAsync(action) {
  return new Promise((resolve) => {
    setTimeout(() => {
      action();
      resolve();
    }, 500);
  });
}

function updateUI() {
  saveMovies();
  render();
}

async function addMovie(title, director) {
  await runAsync(() => {
    movieList.push(new Movie(title, director));
  });
  updateUI();
}

async function removeMovie(item) {
  await runAsync(() => {
    movieList = movieList.filter((m) => m !== item);
  });
  updateUI();
}

async function addActor(item, name) {
  await runAsync(() => {
    item.addActor(name);
  });
  updateUI();
}

async function removeActor(item, name) {
  await runAsync(() => {
    item.removeActor(name);
  });
  updateUI();
}

function render() {
  list.innerHTML = '';

  for (const item of movieList) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.testid = 'entity-card';

    const title = document.createElement('h2');
    title.textContent = item.title;

    const director = document.createElement('p');
    director.textContent = `Режиссёр: ${item.director}`;

    const actorsList = document.createElement('ul');
    for (const actor of item.actors) {
      const li = document.createElement('li');
      li.textContent = `${actor} `;

      const removeActorButton = document.createElement('button');
      removeActorButton.textContent = 'Удалить актера';
      removeActorButton.addEventListener('click', () => {
        removeActor(item, actor);
      });

      li.append(removeActorButton);
      actorsList.append(li);
    }

    const actorForm = document.createElement('form');
    const actorInput = document.createElement('input');
    actorInput.placeholder = 'Имя актера';
    actorInput.required = true;
    const addActorButton = document.createElement('button');
    addActorButton.type = 'submit';
    addActorButton.textContent = 'Добавить актера';
    actorForm.append(actorInput, addActorButton);

    actorForm.addEventListener('submit', (event) => {
      event.preventDefault();
      addActor(item, actorInput.value.trim());
    });

    const removeMovieButton = document.createElement('button');
    removeMovieButton.textContent = 'Удалить фильм';
    removeMovieButton.dataset.testid = 'delete-entity';
    removeMovieButton.addEventListener('click', () => {
      removeMovie(item);
    });

    card.append(title, director, actorsList, actorForm, removeMovieButton);
    list.append(card);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addMovie(
    form.elements.title.value.trim(),
    form.elements.director.value.trim(),
  );
  form.reset();
});

window.addEventListener('beforeunload', saveMovies);

render();

export {
  Movie,
  groupMoviesByDirector,
  getUniqueActors,
  groupMoviesByCastSize,
  findMoviesByActor,
  getMovieTitles,
} from './model.js';
