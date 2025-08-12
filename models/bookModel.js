// models/bookModel.js
const db = require('../config/db');

const Book = {
  async findAll() {
    const q = 'SELECT * FROM books ORDER BY book_id ASC';
    const { rows } = await db.query(q);
    return rows;
  },

  async findById(id) {
    const q = 'SELECT * FROM books WHERE book_id = $1';
    const { rows } = await db.query(q, [id]);
    return rows[0];
  },

  async findByISBN(isbn) {
    const q = 'SELECT * FROM books WHERE isbn = $1';
    const { rows } = await db.query(q, [isbn]);
    return rows[0];
  },

  async create({ title, author, isbn, available_quantity = 1, shelf_location = null }) {
    const q = `INSERT INTO books (title, author, isbn, available_quantity, shelf_location)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const { rows } = await db.query(q, [title, author, isbn, available_quantity, shelf_location]);
    return rows[0];
  },

  async update(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null; // nothing to update

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${idx++}`);
    values.push(value);
  }

  // always update updated_at
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  const q = `
    UPDATE books
    SET ${setClauses.join(', ')}
    WHERE book_id = $${idx}
    RETURNING *;
  `;

  values.push(id);

  const { rows } = await db.query(q, values);
  return rows[0];
 },

  async remove(id) {
    const q = `DELETE FROM books WHERE book_id = $1 RETURNING *`;
    const { rows } = await db.query(q, [id]);
    return rows[0];
  },

  async search({ title, author, isbn }) {
    const clauses = [];
    const params = [];
    let idx = 1;
    if (title) {
      clauses.push(`LOWER(title) LIKE LOWER($${idx++})`);
      params.push(`%${title}%`);
    }
    if (author) {
      clauses.push(`LOWER(author) LIKE LOWER($${idx++})`);
      params.push(`%${author}%`);
    }
    if (isbn) {
      clauses.push(`isbn = $${idx++}`);
      params.push(isbn);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const q = `SELECT * FROM books ${where} ORDER BY book_id ASC`;
    const { rows } = await db.query(q, params);
    return rows;
  }
};

module.exports = Book;
