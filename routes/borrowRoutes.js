// routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const validate = require('../middlewares/validate');
const { checkoutLimiter, returnLimiter } = require('../middlewares/rateLimiters');
const { z } = require('zod');

const checkoutSchema = z.object({
  body: z.object({
    borrower_id: z.number().int(),
    book_id: z.number().int(),
    days: z.number().int().positive().optional()
  })
});

// 1. Checkout a book
router.post('/checkout', checkoutLimiter, borrowController.checkoutBook);

// 2. Return a book
router.put('/return/:id', returnLimiter, borrowController.returnBook);

// 3. Get current books for a borrower
router.get('/current/:borrowerId', borrowController.getCurrentBorrowedBooks);

// 4. Get overdue books
router.get('/overdue', borrowController.getOverdueBooks);


//Bonus
// GET /api/borrows/export/all-borrows-in-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv|xlsx
router.get('/export/all-borrows-in-range', borrowController.exportAllBorrowsInRange);

// GET all overdues of the last month
router.get('/export/overdue-last-month', borrowController.exportOverdueLastMonth);

// GET all borrowing of the last month
router.get('/export/all-borrows-last-month', borrowController.exportAllBorrowsLastMonth);


module.exports = router;
