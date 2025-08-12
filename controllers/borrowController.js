const borrowService = require('../services/borrowService');

// POST /api/borrows/checkout -> Checkout a book
exports.checkoutBook = async (req, res, next) => {
  try {
    const result = await borrowService.checkoutBook(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
};

// PUT /api/borrows/return/:id  -> Return a book by id
exports.returnBook = async (req, res, next) => {
  try {
    const updated = await borrowService.returnBook(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
};

// GET /api/borrows/current/:borrowerId -> get borrowed books for a borrower (by id)
exports.getCurrentBorrowedBooks = async (req, res, next) => {
  try {
    const rows = await borrowService.getCurrentBorrowedBooks(req.params.borrowerId);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/borrows/overdue -> get all overdue borrows
exports.getOverdueBooks = async (req, res, next) => {
  try {
    const rows = await borrowService.getOverdueBooks();
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/borrows/export?parameters -> export all borrows in a range in xlsx or csv format
exports.exportAllBorrowsInRange = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }
    if (!['csv', 'xlsx'].includes(format.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid format. Allowed: csv, xlsx' });
    }

    const { rows } = await borrowService.exportAllBorrowsInRange({ startDate, endDate, format });

    if (format.toLowerCase() === 'csv') {
      const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
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
      const ExcelJS = require('exceljs');
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
      rows.forEach(row => worksheet.addRow(row));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="borrowing_report_${startDate}_to_${endDate}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) { next(err); }
};

// GET /api/borrows/exports -> Export overdue borrows of last month as CSV
exports.exportOverdueLastMonth = async (req, res, next) => {
  try {
    const { rows, startDate, endDate } = await borrowService.exportOverdueLastMonth();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No overdue borrows found for last month' });
    }
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Overdue Borrows');
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
        d.setHours(12, 0, 0, 0);
        return d;
      }
      row.checkout_date = toLocalDate(row.checkout_date);
      row.due_date = toLocalDate(row.due_date);
      row.return_date = toLocalDate(row.return_date);
      sheet.addRow(row);
    });
    const tempDate = new Date(endDate);
    tempDate.setDate(tempDate.getDate() - 1);
    const printedEndDateName = tempDate.toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=overdue_borrows_${startDate}_to_${printedEndDateName}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};

// GET /api/borrows/export -> Export all borrows of last month as Excel (.xlsx)
exports.exportAllBorrowsLastMonth = async (req, res, next) => {
  try {
    const { rows, startDate, endDate } = await borrowService.exportAllBorrowsLastMonth();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No borrows found for last month' });
    }
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Borrows');
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
        d.setHours(12, 0, 0, 0);
        return d;
      }
      row.checkout_date = toLocalDate(row.checkout_date);
      row.due_date = toLocalDate(row.due_date);
      row.return_date = toLocalDate(row.return_date);
      sheet.addRow(row);
    });
    const tempDate = new Date(endDate);
    tempDate.setDate(tempDate.getDate() - 1);
    const printedEndDateName = tempDate.toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=borrows_${startDate}_to_${printedEndDateName}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};
