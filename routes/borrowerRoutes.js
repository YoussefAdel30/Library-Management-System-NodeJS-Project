// routes/borrowerRoutes.js
const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email()
  })
});

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional()
  })
});

router.get('/', borrowerController.getAll);
router.get('/:id', borrowerController.getById);
router.post('/', validate(createSchema), borrowerController.create);
router.put('/:id', validate(updateSchema), borrowerController.update);
router.delete('/:id', borrowerController.remove);

module.exports = router;
