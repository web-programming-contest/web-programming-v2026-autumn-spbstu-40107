class Movie {
  title;
  director;
  actors;

  constructor(title, director, actors = []) {
    this.profile = {title, director, actors};
  }

  get profile() {
    return {
      title: this.title,
      director: this.director,
      actors: this.actors,
    };
  }

  set profile(value) {
    if ('title' in value) {
      if (typeof value.title !== 'string') {
        throw new TypeError('title must be a string');
      }
      this.title = value.title;
    }

    if ('director' in value) {
      if (typeof value.director !== 'string') {
        throw new TypeError('director must be a string');
      }
      this.director = value.director;
    }

    if ('actors' in value) {
      if (!Array.isArray(value.actors)) {
        throw new TypeError('actors must be an array');
      }
      if (!value.actors.every((actor) => typeof actor === 'string')) {
        throw new TypeError('all actors must be string');
      }
      this.actors = value.actors;
    }
  }

  addActor(name) {
    if (typeof name !== 'string') {
      throw new TypeError('actor name must be a string');
    }
    this.actors.push(name);
  }

  removeActor(name) {
    const index = this.actors.indexOf(name);
    if (index !== -1) {
      this.actors.splice(index, 1);
    }
  }

  get castSize() {
    return this.actors.length;
  }
}

function groupMoviesByDirector(movies) {
  const result = {};
  for (let i = 0; i < movies.length; i++) {
    const director = movies[i].profile.director;

    if (!(director in result)) {
      result[director] = [];
    }
    result[director].push(movies[i]);
  }

  return result;
}

function getUniqueActors(movies) {
  const result = [];

  for (let i = 0; i < movies.length; i++) {
    const actors = movies[i].profile.actors;

    for (let j = 0; j < actors.length; j++) {
      if (!result.includes(actors[j])) {
        result.push(actors[j]);
      }
    }
  }

  return result;
}

function groupMoviesByCastSize(movies) {
  const result = {};
  for (let i = 0; i < movies.length; i++) {
    const size = movies[i].castSize;

    if (!(size in result)) {
      result[size] = [];
    }
    result[size].push(movies[i]);
  }

  return result;
}

function findMoviesByActor(movies, actorName) {
  const result = [];
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].profile.actors.includes(actorName)) {
      result.push(movies[i]);
    }
  }

  return result;
}

function getMovieTitles(movies) {
  const result = [];
  for (let i = 0; i < movies.length; i++) {
    result.push(movies[i].profile.title);
  }

  return result;
}

export {
  Movie,
  groupMoviesByDirector,
  getUniqueActors,
  groupMoviesByCastSize,
  findMoviesByActor,
  getMovieTitles,
};
