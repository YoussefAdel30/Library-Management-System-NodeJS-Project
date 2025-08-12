const borrowerService = require('../services/borrowerService');

// GET all borrowers in the database
exports.getAll = async (req, res, next) => {
  try {
    res.json(await borrowerService.getAllBorrowers());
  } catch (err) { next(err); }
};

// GET a borrower by id
exports.getById = async (req, res, next) => {
  try {
    const b = await borrowerService.getBorrowerById(req.params.id);
    if (!b) return res.status(404).json({ error: 'Borrower not found' });
    res.json(b);
  } catch (err) { next(err); }
};

// CREATE new borrower
exports.create = async (req, res, next) => {
  try {
    const created = await borrowerService.createBorrower(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  }
};

// Update a borrower info.
exports.update = async (req, res, next) => {
  try {
    const updated = await borrowerService.updateBorrower(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Borrower not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

// Remove a borrower
exports.remove = async (req, res, next) => {
  try {
    const deleted = await borrowerService.removeBorrower(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Borrower not found' });
    res.json({ message: 'Borrower deleted' });
  } catch (err) { next(err); }
};
