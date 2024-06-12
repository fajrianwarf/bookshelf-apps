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
    isFinishedButton.innerHTML = '<i class="fas fa-check"></i> Tandai selesai dibaca';
    isFinishedButton.classList.add('green');
    isFinishedButton.addEventListener('click', function () {
      copiedBooks.forEach(book => {
        if (book.id === id) return book.isComplete = true;
      })
      localStorage.setItem(storageKey, JSON.stringify(copiedBooks));
      fireEvent();
    });
  } else {
    isFinishedButton.innerHTML = '<i class="fas fa-refresh"></i> Baca ulang';
    isFinishedButton.classList.add('yellow');
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
  btnRemoveBook.innerHTML = '<i class="fas fa-trash"></i> Hapus buku';
  btnRemoveBook.addEventListener('click', function () {
    bookIdToDelete = id;
    document.getElementById('deleteModal').style.display = 'flex';
  });

  const btnEditBook = document.createElement('button');
  btnEditBook.classList.add('blue');
  btnEditBook.innerHTML = '<i class="fas fa-edit"></i> Edit buku';
  btnEditBook.addEventListener('click', function () {
    bookIdToEdit = id;
    const book = books.find(book => book.id === id);
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookYear').value = book.year;
    document.getElementById('editBookIsComplete').checked = book.isComplete;
    document.getElementById('editModal').style.display = 'flex';
  });


  actionButtons.append(btnRemoveBook);
  actionButtons.append(btnEditBook);
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

function editBook(e) {
  e.preventDefault();

  const title = document.querySelector('#editBookTitle').value;
  const author = document.querySelector('#editBookAuthor').value;
  const year = document.querySelector('#editBookYear').value;
  const isComplete = document.querySelector('#editBookIsComplete').checked;

  const bookIndex = books.findIndex(book => book.id === bookIdToEdit);
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
  books = books.filter(book => book.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(books));
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
