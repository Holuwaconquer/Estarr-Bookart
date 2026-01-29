const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccount.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', bankAccountController.getAllBankAccounts);
router.get('/:id', bankAccountController.getBankAccount);

// Admin routes
router.post('/', protect, authorize('admin'), bankAccountController.createBankAccount);
router.put('/:id', protect, authorize('admin'), bankAccountController.updateBankAccount);
router.delete('/:id', protect, authorize('admin'), bankAccountController.deleteBankAccount);
router.patch('/:id/toggle', protect, authorize('admin'), bankAccountController.toggleBankAccountStatus);

module.exports = router;
