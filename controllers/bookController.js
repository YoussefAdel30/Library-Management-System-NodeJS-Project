// controllers/bookController.js
const Book = require('../models/bookModel');

exports.getAll = async (req, res, next) => {
  try {
    const rows = await Book.findAll();
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = req.body;
    const created = await Book.create(payload);
    res.status(201).json(created);
  } catch (err) {
    // handle unique constraint violation for ISBN
    if (err.code === '23505') {
      return res.status(409).json({ error: 'ISBN or unique field already exists' });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Book.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Book.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) { next(err); }
};

exports.search = async (req, res, next) => {
  try {
    const results = await Book.search(req.query);
    res.json(results);
  } catch (err) { next(err); }
};

exports.search = async (req, res, next) => {
  try {
    const { title, author, isbn } = req.query;
    const results = await Book.search({ title, author, isbn });
    res.json(results);
  } catch (err) {
    next(err);
  }
};

