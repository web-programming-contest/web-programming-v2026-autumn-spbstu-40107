import {Movie} from './model.js';

const STORAGE_KEY = 'movie-collection';

const movieForm = document.querySelector('#movie-form');
const movieList = document.querySelector('#movie-list');
const actorForm = document.querySelector('#actor-form');
const actorMovieSelect = document.querySelector('#actor-movie');
const actorNameInput = document.querySelector('#actor-name');
const removeActorButton = document.querySelector('#remove-actor');

const movies = loadMovies();

function loadMovies() {
  try {
    const savedMovies = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(savedMovies)) {
      return [];
    }

    return savedMovies.map(
      (movie) =>
        new Movie(
          movie.title,
          movie.director,
          Array.isArray(movie.actors) ? movie.actors : [],
        ),
    );
  } catch {
    return [];
  }
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function createMovieCard(movie) {
  const card = document.createElement('article');
  card.className = 'movie-card';
  card.dataset.testid = 'entity-card';

  const title = document.createElement('h3');
  title.textContent = movie.title;

  const director = document.createElement('p');
  director.textContent = `Режиссёр: ${movie.director}`;

  const castHeading = document.createElement('h4');
  castHeading.textContent = `Актёры (${movie.castSize})`;

  const actorsList = document.createElement('ul');

  if (movie.actors.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Актёры пока не добавлены';
    actorsList.append(emptyItem);
  } else {
    for (const actor of movie.actors) {
      const item = document.createElement('li');
      item.textContent = actor;
      actorsList.append(item);
    }
  }

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'button button-secondary';
  deleteButton.dataset.testid = 'delete-entity';
  deleteButton.textContent = 'Удалить фильм';

  deleteButton.addEventListener('click', async () => {
    deleteButton.disabled = true;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const movieIndex = movies.indexOf(movie);

    if (movieIndex !== -1) {
      movies.splice(movieIndex, 1);
      saveMovies();
      renderMovies();
    }
  });

  card.append(title, director, castHeading, actorsList, deleteButton);

  return card;
}

function renderMovies() {
  movieList.replaceChildren();

  movies.forEach((movie) => {
    movieList.append(createMovieCard(movie));
  });

  updateMovieSelect();
}

function updateMovieSelect() {
  actorMovieSelect.replaceChildren();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Выберите фильм';
  actorMovieSelect.append(placeholder);

  movies.forEach((movie, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = movie.title;
    actorMovieSelect.append(option);
  });
}

movieForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(movieForm);
  const title = String(formData.get('title')).trim();
  const director = String(formData.get('director')).trim();

  if (!title || !director) {
    return;
  }

  const submitButton = movieForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  await new Promise((resolve) => setTimeout(resolve, 300));

  movies.push(new Movie(title, director));

  saveMovies();
  renderMovies();
  movieForm.reset();

  submitButton.disabled = false;
});

actorForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const movieIndex = Number(actorMovieSelect.value);
  const actorName = actorNameInput.value.trim();

  if (actorMovieSelect.value === '' || !movies[movieIndex] || !actorName) {
    return;
  }

  const submitButton = actorForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  await new Promise((resolve) => setTimeout(resolve, 300));

  movies[movieIndex].addActor(actorName);

  saveMovies();
  renderMovies();
  actorNameInput.value = '';

  submitButton.disabled = false;
});

removeActorButton.addEventListener('click', async () => {
  const movieIndex = Number(actorMovieSelect.value);
  const actorName = actorNameInput.value.trim();

  if (actorMovieSelect.value === '' || !movies[movieIndex] || !actorName) {
    return;
  }

  removeActorButton.disabled = true;

  await new Promise((resolve) => setTimeout(resolve, 300));

  movies[movieIndex].removeActor(actorName);

  saveMovies();
  renderMovies();
  actorNameInput.value = '';

  removeActorButton.disabled = false;
});

renderMovies();
