const storageKey = 'BOOKSHELF';
const renderEvent = 'RENDER_BOOKS';
let books = localStorage.getItem(storageKey)
  ? JSON.parse(localStorage.getItem(storageKey))
  : [];

function createEmptyCard() {
  const bookCard = document.createElement('article');
  bookCard.classList.add('empty_list');

  const bookTitle = document.createElement('h3');
  bookTitle.innerText = 'Tidak ada list buku';
  bookCard.append(bookTitle);

  return bookCard;
}

function createBookCard(book) {
  const { id, title, author, year, isComplete } = book;

  const bookCard = document.createElement('article');
  bookCard.classList.add('book_item');

  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title;
  bookCard.append(bookTitle);

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = author;
  bookCard.append(bookAuthor);

  const bookYear = document.createElement('p');
  bookYear.innerText = year;
  bookCard.append(bookYear);

  const actionButtons = document.createElement('div');
  actionButtons.classList.add('action');

  const isFinishedButton = document.createElement('button');
  const copiedBooks = books;

  if (!isComplete) {
    isFinishedButton.innerText = 'Finished Reading';
    isFinishedButton.classList.add('green');
    isFinishedButton.addEventListener('click', function () {
      copiedBooks.forEach(book => {
        if (book.id === id) return book.isComplete = true;
      })
      localStorage.setItem(storageKey, JSON.stringify(copiedBooks));
      fireEvent();
    });
  } else {
    isFinishedButton.innerText = 'Unfinished Reading';
    isFinishedButton.classList.add('red');
    isFinishedButton.addEventListener('click', function () {
      copiedBooks.forEach(book => {
        if (book.id === id) return book.isComplete = false;
      })
      localStorage.setItem(storageKey, JSON.stringify(copiedBooks));
      fireEvent();
    });
  }

  actionButtons.append(isFinishedButton);

  const btnRemoveBook = document.createElement('button');
  btnRemoveBook.classList.add('red');
  btnRemoveBook.innerText = 'Remove Book';
  btnRemoveBook.addEventListener('click', function () {
    const filteredBooks = books.filter(book => book.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(filteredBooks));
    fireEvent();
  });

  actionButtons.append(btnRemoveBook);
  bookCard.append(actionButtons);

  return bookCard;
}

function addBook(e) {
  e.preventDefault();

  const title = document.querySelector('#inputBookTitle').value;
  const author = document.querySelector('#inputBookAuthor').value;
  const year = document.querySelector('#inputBookYear').value;
  const isComplete = document.querySelector('#inputBookIsComplete').checked;

  const newData = {
    id: +new Date(),
    title,
    author,
    year: Number(year),
    isComplete,
  };

  const storage = localStorage.getItem(storageKey);

  if (storage && JSON.parse(storage).length > 0) {
    const dataToSave = [...JSON.parse(storage), newData];
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    books = dataToSave;
  } else {
    localStorage.setItem(storageKey, JSON.stringify([newData]));
    books = [newData];
  }

  fireEvent();
}

function searchedBooks(searchKey) {
  return books.find((book) => book.title.toLowerCase().includes(searchKey));
}

function renderBooks(customBooks) {
  const incompleteBookshelf = document.querySelector(
    '#incompleteBookshelfList'
  );
  const completeBookshelf = document.querySelector('#completeBookshelfList');
  incompleteBookshelf.innerHTML = '';
  completeBookshelf.innerHTML = '';

  const savedBooks = localStorage.getItem(storageKey);
  if (savedBooks) {
    books = JSON.parse(savedBooks);
  }

  if (customBooks) {
    books = customBooks;
  }

  let hasIncompleteBooks = false;
  let hasCompleteBooks = false;

  for (const book of books) {
    const bookElement = createBookCard(book);
    if (!book.isComplete) {
      incompleteBookshelf.append(bookElement);
      hasIncompleteBooks = true;
    } else {
      completeBookshelf.append(bookElement);
      hasCompleteBooks = true;
    }
  }

  if (!hasIncompleteBooks) {
    incompleteBookshelf.append(createEmptyCard());
  }

  if (!hasCompleteBooks) {
    completeBookshelf.append(createEmptyCard());
  }
}

function fireEvent() {
  document.dispatchEvent(new Event(renderEvent));
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (e) {
    addBook(e);
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const keyword = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(keyword)
    );
    renderBooks(filteredBooks);
  });

  fireEvent();
});

document.addEventListener(renderEvent, function () {
  renderBooks();
});
