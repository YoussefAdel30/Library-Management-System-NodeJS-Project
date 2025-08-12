// controllers/borrowerController.js
const Borrower = require('../models/borrowerModel');

exports.getAll = async (req, res, next) => {
  try { res.json(await Borrower.findAll()); } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const b = await Borrower.findById(req.params.id);
    if (!b) return res.status(404).json({ error: 'Borrower not found' });
    res.json(b);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const created = await Borrower.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Borrower.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Borrower not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Borrower.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Borrower not found' });
    res.json({ message: 'Borrower deleted' });
  } catch (err) { next(err); }
};
