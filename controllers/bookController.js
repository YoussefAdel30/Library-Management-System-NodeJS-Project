const bookService = require('../services/bookService');

// GET All Books in Database
exports.getAll = async (req, res, next) => {
  try {
    const rows = await bookService.getAllBooks();
    res.json(rows);
  } catch (err) { next(err); }
};

// GET a book by its ID
exports.getById = async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
};

// CREATE a book
exports.create = async (req, res, next) => {
  try {
    const created = await bookService.createBook(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
};

// Update a book by ID
exports.update = async (req, res, next) => {
  try {
    const updated = await bookService.updateBook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

// Remove a book by ID
exports.remove = async (req, res, next) => {
  try {
    const deleted = await bookService.removeBook(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) { next(err); }
};

// Search by title,author or ISBN
exports.search = async (req, res, next) => {
  try {
    const results = await bookService.searchBooks(req.query);
    res.json(results);
  } catch (err) { next(err); }
};
