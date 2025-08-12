const Book = require('../models/bookModel');

/**
 * Service to get all books from the database
 */
async function getAllBooks() {
  return await Book.findAll();
}

/**
 * Service to get a book by its ID
 */
async function getBookById(id) {
  return await Book.findById(id);
}

/**
 * Service to create a new book
 * Handles unique constraint violation for ISBN
 */
async function createBook(payload) {
  try {
    return await Book.create(payload);
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error('ISBN or unique field already exists');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

/**
 * Service to update a book by ID
 */
async function updateBook(id, payload) {
  return await Book.update(id, payload);
}

/**
 * Service to remove a book by ID
 */
async function removeBook(id) {
  return await Book.remove(id);
}

/**
 * Service to search books by title, author, or ISBN
 */
async function searchBooks(filters) {
  return await Book.search(filters);
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  removeBook,
  searchBooks
};
