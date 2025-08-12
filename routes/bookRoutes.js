const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().min(1),
    available_quantity: z.number().int().nonnegative().optional(),
    shelf_location: z.string().optional().nullable()
  })
});

const updateBookSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    isbn: z.string().min(1).optional(),
    available_quantity: z.number().int().nonnegative().optional(),
    shelf_location: z.string().optional().nullable()
  })
});


// 1. GET all borrowers
router.get('/', bookController.getAll);
// 2. SEARCH for a book by author,title or ISBN
router.get('/search', bookController.search);
// 3. GET a book by id
router.get('/:id', bookController.getById);
// 4. CREATE a new book
router.post('/', validate(createBookSchema), bookController.create);
// 5. UPDATE a book info
router.put('/:id', validate(updateBookSchema), bookController.update);
// 6. DELETE a book
router.delete('/:id', bookController.remove);

module.exports = router;
