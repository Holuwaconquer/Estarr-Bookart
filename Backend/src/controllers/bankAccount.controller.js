const BankAccount = require('../models/BankAccount');
const ApiResponse = require('../utils/apiResponse');

// Get all bank accounts (public - for payment)
exports.getAllBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ isActive: true }).sort({ isPrimary: -1 });
    
    if (!accounts.length) {
      return ApiResponse.error(res, 'No bank accounts available', 404);
    }

    return ApiResponse.success(res, 'Bank accounts retrieved successfully', accounts);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get single bank account
exports.getBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await BankAccount.findById(id);

    if (!account) {
      return ApiResponse.error(res, 'Bank account not found', 404);
    }

    return ApiResponse.success(res, 'Bank account retrieved successfully', account);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Create bank account (admin only)
exports.createBankAccount = async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, bankCode, isPrimary, notes } = req.body;

    // Validate required fields
    if (!accountName || !accountNumber || !bankName) {
      return ApiResponse.error(res, 'Account name, number, and bank name are required', 400);
    }

    const newAccount = new BankAccount({
      accountName,
      accountNumber,
      bankName,
      bankCode,
      isPrimary: isPrimary || false,
      notes,
      isActive: true
    });

    await newAccount.save();

    return ApiResponse.success(res, 'Bank account created successfully', newAccount, 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update bank account (admin only)
exports.updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const account = await BankAccount.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!account) {
      return ApiResponse.error(res, 'Bank account not found', 404);
    }

    return ApiResponse.success(res, 'Bank account updated successfully', account);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Delete bank account (admin only)
exports.deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findByIdAndDelete(id);

    if (!account) {
      return ApiResponse.error(res, 'Bank account not found', 404);
    }

    return ApiResponse.success(res, 'Bank account deleted successfully', null);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Toggle bank account active status
exports.toggleBankAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findById(id);

    if (!account) {
      return ApiResponse.error(res, 'Bank account not found', 404);
    }

    account.isActive = !account.isActive;
    await account.save();

    return ApiResponse.success(res, 'Bank account status updated successfully', account);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};
