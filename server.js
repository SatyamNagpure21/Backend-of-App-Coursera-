// server.js
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/*
 In-memory storage (option 1 chosen)
 Structure:
  - books: { isbn: { isbn, title, author, reviews: { username: reviewText } } }
  - users: { username: { username, password } }
*/
const books = {
  "9780140449136": {
    isbn: "9780140449136",
    title: "The Odyssey",
    author: "Homer",
    reviews: {
      "alice": "A timeless classic."
    }
  },
  "9780261103573": {
    isbn: "9780261103573",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    reviews: {}
  }
};

const users = {}; // username -> { username, password }

// ---------- General Users Endpoints ----------

// Task 1: Get the book list available in the shop. - GET /books
app.get('/books', (req, res) => {
  const list = Object.values(books).map(b => ({
    isbn: b.isbn, title: b.title, author: b.author
  }));
  res.json({ success: true, books: list });
});

// Task 2: Get the books based on ISBN. - GET /books/isbn/:isbn
app.get('/books/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, book });
});

// Task 3: Get all books by Author. - GET /books/author/:author
app.get('/books/author/:author', (req, res) => {
  const authorQuery = req.params.author.toLowerCase();
  const found = Object.values(books).filter(b => b.author.toLowerCase().includes(authorQuery));
  res.json({ success: true, results: found });
});

// Task 4: Get all books based on Title. - GET /books/title/:title
app.get('/books/title/:title', (req, res) => {
  const titleQuery = req.params.title.toLowerCase();
  const found = Object.values(books).filter(b => b.title.toLowerCase().includes(titleQuery));
  res.json({ success: true, results: found });
});

// Task 5: Get book Review. - GET /books/:isbn/reviews
app.get('/books/:isbn/reviews', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, reviews: book.reviews });
});

// ---------- Registered Users Endpoints ----------

// Task 6: Register New user - POST /users/register
// Body: { username, password }
app.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'username and password required' });
  if (users[username]) return res.status(409).json({ success: false, message: 'User already exists' });
  users[username] = { username, password };
  res.json({ success: true, message: 'User registered' });
});

// Task 7: Login as a Registered user - POST /users/login
// Body: { username, password }
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  // Simple "session" in response (not JWT) — for assignment simplicity.
  res.json({ success: true, message: 'Login successful', username });
});

// Middleware to simulate simple auth: username passed in header 'x-username' or in body
function requireUser(req, res, next) {
  const username = req.header('x-username') || (req.body && req.body.username);
  if (!username || !users[username]) return res.status(401).json({ success: false, message: 'Unauthorized: user required' });
  req.username = username;
  next();
}

// Task 8: Add/Modify a book review - POST /books/:isbn/review
// Body: { username, review }  OR send header x-username
app.post('/books/:isbn/review', requireUser, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const book = books[isbn];
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  book.reviews[req.username] = review || '';
  res.json({ success: true, message: 'Review saved', reviews: book.reviews });
});

// Task 9: Delete book review added by that particular user - DELETE /books/:isbn/review
// Body: { username } OR header x-username
app.delete('/books/:isbn/review', requireUser, (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  if (!book.reviews[req.username]) return res.status(404).json({ success: false, message: 'Review not found for this user' });
  delete book.reviews[req.username];
  res.json({ success: true, message: 'Review deleted', reviews: book.reviews });
});

// ---- Utility: Add a book (helper, not in tasks but useful) ----
app.post('/books', (req, res) => {
  const { isbn, title, author } = req.body;
  if (!isbn || !title || !author) return res.status(400).json({ success: false, message: 'isbn, title, author required' });
  if (books[isbn]) return res.status(409).json({ success: false, message: 'Book already exists' });
  books[isbn] = { isbn, title, author, reviews: {} };
  res.json({ success: true, book: books[isbn] });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
