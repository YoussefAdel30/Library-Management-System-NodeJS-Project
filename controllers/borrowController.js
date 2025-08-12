// controllers/borrowController.js
const pool = require('../config/db');
const Borrow = require('../models/borrowModel');




// POST /api/borrows/checkout
exports.checkoutBook = async (req, res, next) => {
  const { borrower_id, book_id, days = 14 } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the book row to avoid race conditions
    const bookRes = await client.query(
      'SELECT available_quantity FROM books WHERE book_id = $1 FOR UPDATE',
      [book_id]
    );

    if (bookRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Book not found' });
    }

    if (bookRes.rows[0].available_quantity <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No copies available' });
    }

    // Reduce available quantity
    await client.query(
      'UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = $1',
      [book_id]
    );

    // Calculate due date
    const due_date = (await client.query(
      'SELECT CURRENT_DATE + $1::int AS due_date',
      [days]
    )).rows[0].due_date;

    // Insert borrowing record
    const insertRes = await client.query(
      `INSERT INTO borrowings (borrower_id, book_id, checkout_date, due_date)
       VALUES ($1, $2, CURRENT_DATE, $3) RETURNING *`,
      [borrower_id, book_id, due_date]
    );

    await client.query('COMMIT');
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

// PUT /api/borrows/return/:id
exports.returnBook = async (req, res, next) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const borrowRes = await client.query(
      'SELECT * FROM borrowings WHERE borrowing_id = $1 FOR UPDATE',
      [id]
    );

    if (borrowRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Borrow record not found' });
    }

    const borrow = borrowRes.rows[0];
    if (borrow.return_date) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Book already returned' });
    }

    // Mark as returned
    await client.query(
      'UPDATE borrowings SET return_date = CURRENT_DATE WHERE borrowing_id = $1',
      [id]
    );

    // Increment available quantity
    await client.query(
      'UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id = $1',
      [borrow.book_id]
    );

    await client.query('COMMIT');

    const updated = await Borrow.findById(id);
    res.json(updated);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/borrows/current/:borrowerId
exports.getCurrentBorrowedBooks = async (req, res, next) => {
  try {
    const rows = await Borrow.findActiveByBorrower(req.params.borrowerId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/borrows/overdue
exports.getOverdueBooks = async (req, res, next) => {
  try {
    const rows = await Borrow.findOverdue();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};



//Bonus

const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;


exports.exportAllBorrowsInRange = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    if (!['csv', 'xlsx'].includes(format.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid format. Allowed: csv, xlsx' });
    }

    // Query data
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

    if (format.toLowerCase() === 'csv') {
      // Generate CSV string
      const csvWriter = createCsvWriter({
        header: [
          { id: 'borrowing_id', title: 'Borrowing ID' },
          { id: 'borrower_id', title: 'Borrower ID' },
          { id: 'borrower_name', title: 'Borrower Name' },
          { id: 'book_id', title: 'Book ID' },
          { id: 'book_title', title: 'Book Title' },
          { id: 'checkout_date', title: 'Checkout Date' },
          { id: 'due_date', title: 'Due Date' },
          { id: 'return_date', title: 'Return Date' },
        ],
      });

      const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(rows);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="borrowing_report_${startDate}_to_${endDate}.csv"`);
      return res.send(csvString);
    } else {
      // Generate XLSX
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Borrowing Report');

      worksheet.columns = [
        { header: 'Borrowing ID', key: 'borrowing_id', width: 15 },
        { header: 'Borrower ID', key: 'borrower_id', width: 15 },
        { header: 'Borrower Name', key: 'borrower_name', width: 25 },
        { header: 'Book ID', key: 'book_id', width: 15 },
        { header: 'Book Title', key: 'book_title', width: 30 },
        { header: 'Checkout Date', key: 'checkout_date', width: 15 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Return Date', key: 'return_date', width: 15 },
      ];

      // Add rows
      rows.forEach(row => {
        worksheet.addRow(row);
      });

      // Send workbook as buffer
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="borrowing_report_${startDate}_to_${endDate}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    next(err);
  }
};

function getLast30DaysRange() {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 28);

  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 2); // tomorrow

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}





// Export overdue borrows of last month as CSV
exports.exportOverdueLastMonth = async (req, res, next) => {
  try {
    const { startDate, endDate } = getLast30DaysRange();

    const rows = await Borrow.findOverdueLastMonth(startDate, endDate);

    const tempDate = new Date(endDate);
    
    tempDate.setDate(tempDate.getDate() - 1);

    const printedEndDateName = tempDate.toISOString().split('T')[0];
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No overdue borrows found for last month' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Overdue Borrows');

    // Define columns
    sheet.columns = [
  { header: 'Borrowing ID', key: 'borrowing_id' },
  { header: 'Borrower Name', key: 'borrower_name' },
  { header: 'Book Title', key: 'book_title' },
  { header: 'Checkout Date', key: 'checkout_date', style: { numFmt: 'yyyy-mm-dd' } },
  { header: 'Due Date', key: 'due_date', style: { numFmt: 'yyyy-mm-dd' } },
  { header: 'Return Date', key: 'return_date', style: { numFmt: 'yyyy-mm-dd' } }
];

  
    rows.forEach(row => {
      function toLocalDate(date) {
        if (!date) return null;
        const d = new Date(date);
        // Set to noon to avoid timezone shifting the date
        d.setHours(12, 0, 0, 0);
        return d;
      }
      row.checkout_date = toLocalDate(row.checkout_date);
      row.due_date = toLocalDate(row.due_date);
      row.return_date = toLocalDate(row.return_date);

      sheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=overdue_borrows_${startDate}_to_${printedEndDateName}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    next(err);
  }
};


// Export all borrows of last month as Excel (.xlsx)
exports.exportAllBorrowsLastMonth = async (req, res, next) => {
  try {
    const { startDate, endDate } = getLast30DaysRange();

    const rows = await Borrow.findBorrowsLastMonth(startDate, endDate);

    const tempDate = new Date(endDate);
    
    tempDate.setDate(tempDate.getDate() - 1);

    const printedEndDateName = tempDate.toISOString().split('T')[0];




    if (rows.length === 0) {
      return res.status(404).json({ error: 'No borrows found for last month' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Borrows');

    // Define columns for Excel
    sheet.columns = [
  { header: 'Borrowing ID', key: 'borrowing_id' },
  { header: 'Borrower Name', key: 'borrower_name' },
  { header: 'Book Title', key: 'book_title' },
  { header: 'Checkout Date', key: 'checkout_date', style: { numFmt: 'yyyy-mm-dd' } },
  { header: 'Due Date', key: 'due_date', style: { numFmt: 'yyyy-mm-dd' } },
  { header: 'Return Date', key: 'return_date', style: { numFmt: 'yyyy-mm-dd' } }
];

    // When adding rows, convert dates to JS Date objects but set time to noon to avoid timezone shift:
    rows.forEach(row => {
      function toLocalDate(date) {
        if (!date) return null;
        const d = new Date(date);
        // Set to noon to avoid timezone shifting the date
        d.setHours(12, 0, 0, 0);
        return d;
      }
      row.checkout_date = toLocalDate(row.checkout_date);
      row.due_date = toLocalDate(row.due_date);
      row.return_date = toLocalDate(row.return_date);

      sheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=borrows_${startDate}_to_${printedEndDateName}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    next(err);
  }
};

