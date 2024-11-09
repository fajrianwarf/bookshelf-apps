const storageKey = 'BOOKSHELF';
const renderEvent = 'RENDER_BOOKS';
let books = localStorage.getItem(storageKey)
  ? JSON.parse(localStorage.getItem(storageKey))
  : [];
let bookIdToDelete = null;
let bookIdToEdit = null;

function createEmptyCard() {
  const bookCard = document.createElement('article');
  bookCard.classList.add('empty_list');

  const emptyImage = document.createElement('img');
  emptyImage.src = './assets/empty.png';
  emptyImage.alt = 'No books available';
  emptyImage.classList.add('empty_image');

  bookCard.append(emptyImage);

  return bookCard;
}

function createBookCard(book) {
  const { id, title, author, year, isComplete } = book;

  const bookCard = document.createElement('article');
  bookCard.classList.add('book_item');
  bookCard.setAttribute('data-bookid', id);
  bookCard.setAttribute('data-testid', 'bookItem');

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = title;
  bookCard.append(bookTitle);

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = author;
  bookCard.append(bookAuthor);

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = year;
  bookCard.append(bookYear);

  const actionButtons = document.createElement('div');
  actionButtons.classList.add('action');

  const isFinishedButton = document.createElement('button');
  const copiedBooks = books;

  if (!isComplete) {
    isFinishedButton.innerHTML = '✅ Tandai selesai dibaca';
    isFinishedButton.classList.add('to_complete');
    isFinishedButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    isFinishedButton.addEventListener('click', function () {
      copiedBooks.forEach((book) => {
        if (book.id === id) return (book.isComplete = true);
      });
      localStorage.setItem(storageKey, JSON.stringify(copiedBooks));
      fireEvent();
    });
  } else {
    isFinishedButton.innerHTML = '📖 Baca ulang';
    isFinishedButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    isFinishedButton.classList.add('re_read');
    isFinishedButton.addEventListener('click', function () {
      copiedBooks.forEach((book) => {
        if (book.id === id) return (book.isComplete = false);
      });
      localStorage.setItem(storageKey, JSON.stringify(copiedBooks));
      fireEvent();
    });
  }

  actionButtons.append(isFinishedButton);

  const btnRemoveBook = document.createElement('button');
  btnRemoveBook.classList.add('delete');
  btnRemoveBook.setAttribute('data-testid', 'bookItemDeleteButton');
  btnRemoveBook.innerHTML = '🗑️ Hapus buku';
  btnRemoveBook.addEventListener('click', function () {
    bookIdToDelete = id;
    document.getElementById('deleteModal').style.display = 'flex';
  });

  const btnEditBook = document.createElement('button');
  btnRemoveBook.setAttribute('data-testid', 'bookItemEditButton');
  btnEditBook.innerHTML = '✏️ Edit buku';
  btnEditBook.addEventListener('click', function () {
    bookIdToEdit = id;
    const book = books.find((book) => book.id === id);
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookYear').value = book.year;
    document.getElementById('editBookIsComplete').checked = book.isComplete;
    document.getElementById('editModal').style.display = 'flex';
  });

  actionButtons.append(btnEditBook);
  actionButtons.append(btnRemoveBook);
  bookCard.append(actionButtons);

  return bookCard;
}

function addBook(e) {
  e.preventDefault();

  const title = document.querySelector('#bookFormTitle').value;
  const author = document.querySelector('#bookFormAuthor').value;
  const year = document.querySelector('#bookFormYear').value;
  const isComplete = document.querySelector('#bookFormIsComplete').checked;

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

function editBook(e) {
  e.preventDefault();

  const title = document.querySelector('#editBookTitle').value;
  const author = document.querySelector('#editBookAuthor').value;
  const year = document.querySelector('#editBookYear').value;
  const isComplete = document.querySelector('#editBookIsComplete').checked;

  const bookIndex = books.findIndex((book) => book.id === bookIdToEdit);
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex],
      title,
      author,
      year: Number(year),
      isComplete,
    };
    localStorage.setItem(storageKey, JSON.stringify(books));
    fireEvent();
  }

  document.getElementById('editModal').style.display = 'none';
}

function removeBook(id) {
  books = books.filter((book) => book.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(books));
  fireEvent();
}

function searchedBooks(searchKey) {
  return books.find((book) => book.title.toLowerCase().includes(searchKey));
}

function renderBooks(customBooks) {
  const incompleteBookshelf = document.querySelector('#incompleteBookList');
  const completeBookshelf = document.querySelector('#completeBookList');
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
  const titleText = 'Bookshelf Apps';
  const titleElement = document.getElementById('animatedTitle');
  let index = 0;
  let delay = 100;
  let stopDelay = 3000;

  function typeWriter() {
    if (index < titleText.length) {
      titleElement.innerHTML = titleText.substring(0, index + 1);
      index++;
      setTimeout(typeWriter, delay);
    } else {
      setTimeout(() => {
        index = 0;
        titleElement.innerHTML = '';
        typeWriter();
      }, stopDelay);
    }
  }

  typeWriter();

  const checkbox = document.getElementById('bookFormIsComplete');
  const buttonText = document.querySelector('#bookFormSubmit span');

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      buttonText.textContent = 'Sudah Selesai Dibaca 📘';
    } else {
      buttonText.textContent = 'Selesai Dibaca 📖';
    }
  });

  const submitForm = document.getElementById('bookForm');
  submitForm.addEventListener('submit', function (e) {
    addBook(e);
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const keyword = document
      .getElementById('searchBookTitle')
      .value.toLowerCase();
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(keyword)
    );
    renderBooks(filteredBooks);
  });

  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteButton = document.getElementById('confirmDelete');
  const cancelDeleteButton = document.getElementById('cancelDelete');
  const closeModal = document.getElementsByClassName('close')[0];

  confirmDeleteButton.addEventListener('click', function () {
    removeBook(bookIdToDelete);
    bookIdToDelete = null;
    deleteModal.style.display = 'none';
  });

  cancelDeleteButton.addEventListener('click', function () {
    deleteModal.style.display = 'none';
  });

  closeModal.addEventListener('click', function () {
    deleteModal.style.display = 'none';
  });

  window.addEventListener('click', function (event) {
    if (event.target == deleteModal) {
      deleteModal.style.display = 'none';
    }
  });

  const editModal = document.getElementById('editModal');
  const editBookForm = document.getElementById('editBookForm');
  const cancelEditButton = document.getElementById('cancelEdit');
  const closeEditModal = document.getElementsByClassName('close')[1];

  editBookForm.addEventListener('submit', editBook);

  cancelEditButton.addEventListener('click', function () {
    editModal.style.display = 'none';
  });

  closeEditModal.addEventListener('click', function () {
    editModal.style.display = 'none';
  });

  window.addEventListener('click', function (event) {
    if (event.target == editModal) {
      editModal.style.display = 'none';
    }
  });

  fireEvent();
});

document.addEventListener(renderEvent, function () {
  renderBooks();
});
