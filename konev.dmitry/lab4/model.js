export class Movie {
  constructor(title, director, actors = []) {
    this.title = title;
    this.director = director;
    this.actors = [...actors];
  }

  addActor(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      return;
    }

    this.actors.push(name.trim());
  }

  removeActor(name) {
    const index = this.actors.indexOf(name.trim());

    if (index !== -1) {
      this.actors.splice(index, 1);
    }
  }

  get castSize() {
    return this.actors.length;
  }
}

export function groupMoviesByDirector(movies) {
  const result = {};

  for (const movie of movies) {
    if (!result[movie.director]) {
      result[movie.director] = [];
    }

    result[movie.director].push(movie);
  }

  return result;
}

export function getUniqueActors(movies) {
  const actors = new Set();

  for (const movie of movies) {
    for (const actor of movie.actors) {
      actors.add(actor);
    }
  }

  return [...actors];
}

export function groupMoviesByCastSize(movies) {
  const result = {};

  for (const movie of movies) {
    const size = movie.actors.length;

    if (!result[size]) {
      result[size] = [];
    }

    result[size].push(movie);
  }

  return result;
}

export function findMoviesByActor(movies, actorName) {
  return movies.filter((movie) => movie.actors.includes(actorName));
}

export function getMovieTitles(movies) {
  return movies.map((movie) => movie.title);
}
