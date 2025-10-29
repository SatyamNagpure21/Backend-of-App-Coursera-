import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const books = [
  { id: 1, title: "The Alchemist", price: 299 },
  { id: 2, title: "Atomic Habits", price: 450 },
  // ...more books
];

app.get("/books", (req, res) => {
  res.json(books);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));


app.get("/books/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.json(book);
});

app.get("/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  const filteredBooks = books.filter(book =>
    book.author.toLowerCase() === author
  );

  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }

  res.json(filteredBooks);
});



app.get("/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();

  const matchedBooks = books.filter(book =>
    book.title.toLowerCase().includes(title)  // allows partial match
  );

  if (matchedBooks.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  res.json(matchedBooks);
});
