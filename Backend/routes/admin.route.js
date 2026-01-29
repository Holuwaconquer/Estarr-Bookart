const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const { authenticate } = require('../../auth');
const { authorizeRoles } = require('../../authorizesRole');

// Auth
router.post('/signup', adminController.signup);
router.post('/login', adminController.login);

// Category CRUD
router.post('/category', authenticate, authorizeRoles, adminController.createCategory);
router.get('/category', authenticate, authorizeRoles, adminController.getCategories);
router.put('/category/:id', authenticate, authorizeRoles, adminController.updateCategory);
router.delete('/category/:id', authenticate, authorizeRoles, adminController.deleteCategory);

// Book CRUD
router.post('/book', authenticate, authorizeRoles, adminController.createBook);
router.get('/book', authenticate, authorizeRoles, adminController.getBooks);
router.put('/book/:id', authenticate, authorizeRoles, adminController.updateBook);
router.delete('/book/:id', authenticate, authorizeRoles, adminController.deleteBook);

// Users
router.get('/users', authenticate, authorizeRoles, adminController.getUsers);

// Logout
router.post('/logout', authenticate, authorizeRoles, adminController.logout);

module.exports = router;