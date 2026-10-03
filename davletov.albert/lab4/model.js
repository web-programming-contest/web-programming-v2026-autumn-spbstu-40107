export class Library {
  constructor(name, books) {
    this.name = name;
    this.books = books;
  }

  addBook(book) {
    this.books.push(book);
  }

  removeBook(title) {
    const obj = this.books.find((book) => book.title === title);
    const index = this.books.indexOf(obj);

    if (index !== -1) {
      this.books.splice(index, 1);
    }
  }

  get booksCount() {
    return this.books.length;
  }
}

export function groupBooksByGenre(libs) {
  const flatBooks = libs.flatMap((lib) => lib.books);
  const map = Map.groupBy(flatBooks, (book) => book.genre);

  return map;
}

export function getUniqueAuthors(libs) {
  const set = new Set();
  const flatBooks = libs.flatMap((lib) => lib.books);

  for (const book of flatBooks) {
    set.add(book.author);
  }

  return Array.from(set);
}

export function groupBooksByYear(libs) {
  const flatBooks = libs.flatMap((lib) => lib.books);
  const map = Map.groupBy(flatBooks, (book) => book.year);

  return map;
}

export function getUniqueYears(libs) {
  const set = new Set();
  const flatBooks = libs.flatMap((lib) => lib.books);

  for (const book of flatBooks) {
    set.add(book.year);
  }

  return Array.from(set);
}

export function findBooksByAuthor(libs, author) {
  const booksOfAuthor = [];
  const flatBooks = libs.flatMap((lib) => lib.books);

  for (const book of flatBooks) {
    if (book.author === author) {
      booksOfAuthor.push(book);
    }
  }

  return booksOfAuthor;
}
