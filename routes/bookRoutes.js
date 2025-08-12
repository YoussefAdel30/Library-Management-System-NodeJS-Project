// routes/bookRoutes.js
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

router.get('/', bookController.getAll);
router.get('/search', bookController.search);
router.get('/:id', bookController.getById);
router.post('/', validate(createBookSchema), bookController.create);
router.put('/:id', validate(updateBookSchema), bookController.update);
router.delete('/:id', bookController.remove);

module.exports = router;
