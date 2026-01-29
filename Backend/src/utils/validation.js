const validator = require('validator');

/**
 * Sanitize input to prevent injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.trim(validator.escape(input));
  }
  return input;
};

/**
 * Validate email
 */
const validateEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

/**
 * Validate phone number
 */
const validatePhone = (phone) => {
  return validator.isMobilePhone(phone);
};

/**
 * Validate URL
 */
const validateURL = (url) => {
  return validator.isURL(url);
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id) => {
  return validator.isMongoId(id);
};

/**
 * Validate amount (positive number)
 */
const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

/**
 * Sanitize object by escaping all string values
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = validator.trim(validator.escape(value));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validate bank account number format
 */
const validateBankAccount = (accountNumber) => {
  // Nigerian bank accounts are typically 10 digits
  return /^\d{10}$/.test(accountNumber.toString());
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validatePhone,
  validateURL,
  validateObjectId,
  validateAmount,
  sanitizeObject,
  validateBankAccount
};
