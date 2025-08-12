const Borrower = require('../models/borrowerModel');

/**
 * Service to get all borrowers
 */
async function getAllBorrowers() {
  return await Borrower.findAll();
}

/**
 * Service to get borrower by ID
 */
async function getBorrowerById(id) {
  return await Borrower.findById(id);
}

/**
 * Service to create a new borrower
 * Handles unique constraint for email
 */
async function createBorrower(payload) {
  try {
    return await Borrower.create(payload);
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error('Email already exists');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

/**
 * Service to update borrower info
 */
async function updateBorrower(id, payload) {
  return await Borrower.update(id, payload);
}

/**
 * Service to remove a borrower
 */
async function removeBorrower(id) {
  return await Borrower.remove(id);
}

module.exports = {
  getAllBorrowers,
  getBorrowerById,
  createBorrower,
  updateBorrower,
  removeBorrower
};
