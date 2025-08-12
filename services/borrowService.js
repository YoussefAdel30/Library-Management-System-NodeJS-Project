const pool = require('../config/db');
const Borrow = require('../models/borrowModel');
const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

/**
 * Service to checkout a book for a borrower
 * Includes DB transaction & row-level locking
 */
async function checkoutBook({ borrower_id, book_id, days = 14 }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bookRes = await client.query(
      'SELECT available_quantity FROM books WHERE book_id = $1 FOR UPDATE',
      [book_id]
    );

    if (bookRes.rowCount === 0) {
      throw Object.assign(new Error('Book not found'), { statusCode: 404 });
    }

    if (bookRes.rows[0].available_quantity <= 0) {
      throw Object.assign(new Error('No copies available'), { statusCode: 400 });
    }

    await client.query(
      'UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = $1',
      [book_id]
    );

    const due_date = (await client.query(
      'SELECT CURRENT_DATE + $1::int AS due_date',
      [days]
    )).rows[0].due_date;

    const insertRes = await client.query(
      `INSERT INTO borrowings (borrower_id, book_id, checkout_date, due_date)
       VALUES ($1, $2, CURRENT_DATE, $3) RETURNING *`,
      [borrower_id, book_id, due_date]
    );

    await client.query('COMMIT');
    return insertRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Service to return a borrowed book
 */
async function returnBook(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const borrowRes = await client.query(
      'SELECT * FROM borrowings WHERE borrowing_id = $1 FOR UPDATE',
      [id]
    );

    if (borrowRes.rowCount === 0) {
      throw Object.assign(new Error('Borrow record not found'), { statusCode: 404 });
    }

    const borrow = borrowRes.rows[0];
    if (borrow.return_date) {
      throw Object.assign(new Error('Book already returned'), { statusCode: 400 });
    }

    await client.query(
      'UPDATE borrowings SET return_date = CURRENT_DATE WHERE borrowing_id = $1',
      [id]
    );

    await client.query(
      'UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id = $1',
      [borrow.book_id]
    );

    await client.query('COMMIT');
    return await Borrow.findById(id);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Service to get currently borrowed books for a borrower
 */
async function getCurrentBorrowedBooks(borrowerId) {
  return await Borrow.findActiveByBorrower(borrowerId);
}

/**
 * Service to get all overdue borrowed books
 */
async function getOverdueBooks() {
  return await Borrow.findOverdue();
}

/**
 * Helper: Get date range for last 30 days including today
 */
function getLast30DaysRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 28);

  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 2);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}

/**
 * Service to export borrows in a date range (CSV or XLSX)
 */
async function exportAllBorrowsInRange({ startDate, endDate, format }) {
  const q = `
    SELECT br.borrowing_id, br.borrower_id, bo.name AS borrower_name, br.book_id, b.title AS book_title,
           br.checkout_date, br.due_date, br.return_date
    FROM borrowings br
    JOIN borrowers bo ON br.borrower_id = bo.borrower_id
    JOIN books b ON br.book_id = b.book_id
    WHERE br.checkout_date BETWEEN $1 AND $2
    ORDER BY br.checkout_date ASC;
  `;
  const { rows } = await pool.query(q, [startDate, endDate]);
  return { rows };
}

/**
 * Service to export overdue borrows from last month
 */
async function exportOverdueLastMonth() {
  const { startDate, endDate } = getLast30DaysRange();
  const rows = await Borrow.findOverdueLastMonth(startDate, endDate);
  return { rows, startDate, endDate };
}

/**
 * Service to export all borrows from last month
 */
async function exportAllBorrowsLastMonth() {
  const { startDate, endDate } = getLast30DaysRange();
  const rows = await Borrow.findBorrowsLastMonth(startDate, endDate);
  return { rows, startDate, endDate };
}

module.exports = {
  checkoutBook,
  returnBook,
  getCurrentBorrowedBooks,
  getOverdueBooks,
  exportAllBorrowsInRange,
  exportOverdueLastMonth,
  exportAllBorrowsLastMonth
};
