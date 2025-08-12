// models/borrowModel.js
const db = require('../config/db');

const Borrow = {
  async create({ borrower_id, book_id, due_date }) {
    const q = `INSERT INTO borrowings (borrower_id, book_id, checkout_date, due_date)
               VALUES ($1,$2,CURRENT_DATE,$3) RETURNING *`;
    const { rows } = await db.query(q, [borrower_id, book_id, due_date]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM borrowings WHERE borrowing_id = $1', [id]);
    return rows[0];
  },

  async markReturned(id) {
    const { rows } = await db.query(
      `UPDATE borrowings SET return_date = CURRENT_DATE WHERE borrowing_id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  async findActiveByBorrower(borrower_id) {
    const q = `
      SELECT br.*, b.title, b.author, b.isbn, b.shelf_location
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      WHERE br.borrower_id = $1 AND br.return_date IS NULL
      ORDER BY br.due_date ASC
    `;
    const { rows } = await db.query(q, [borrower_id]);
    return rows;
  },

  async findOverdue() {
    const q = `SELECT br.*, bo.name AS borrower_name, b.title FROM borrowings br
               JOIN borrowers bo ON br.borrower_id = bo.borrower_id
               JOIN books b ON br.book_id = b.book_id
               WHERE br.return_date IS NULL AND br.due_date < CURRENT_DATE
               ORDER BY br.due_date ASC`;
    const { rows } = await db.query(q);
    return rows;
  },


  async findOverdueLastMonth(startDate, endDate) {
    const q = `
      SELECT br.borrowing_id, br.borrower_id, bo.name AS borrower_name, br.book_id, b.title AS book_title,
             br.checkout_date, br.due_date, br.return_date
      FROM borrowings br
      JOIN borrowers bo ON br.borrower_id = bo.borrower_id
      JOIN books b ON br.book_id = b.book_id
      WHERE br.return_date IS NULL
        AND br.due_date >= $1 AND br.due_date < $2
      ORDER BY br.due_date ASC;
    `;
    const { rows } = await db.query(q, [startDate, endDate]);
    return rows;
  },
  
  async findBorrowsLastMonth(startDate, endDate) {
    const q = `
      SELECT br.borrowing_id, br.borrower_id, bo.name AS borrower_name, br.book_id, b.title AS book_title,
             br.checkout_date, br.due_date, br.return_date
      FROM borrowings br
      JOIN borrowers bo ON br.borrower_id = bo.borrower_id
      JOIN books b ON br.book_id = b.book_id
      WHERE br.checkout_date >= $1 AND br.checkout_date < $2
      ORDER BY br.checkout_date ASC;
    `;
    const { rows } = await db.query(q, [startDate, endDate]);
    return rows;
  }
};

module.exports = Borrow;
