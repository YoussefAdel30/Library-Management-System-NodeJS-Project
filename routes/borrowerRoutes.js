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


// 1. GET all borrowers
router.get('/', borrowerController.getAll);
// 2. GET a borrower by id
router.get('/:id', borrowerController.getById);
// 3. CREATE a new borrower
router.post('/', validate(createSchema), borrowerController.create);
// 4. UPDATE a borrower info
router.put('/:id', validate(updateSchema), borrowerController.update);
// 5. DELETE a borrower
router.delete('/:id', borrowerController.remove);

module.exports = router;
