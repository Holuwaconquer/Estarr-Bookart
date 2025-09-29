const Admin = require('../model/admin.model');
const Category = require('../model/category.model');
const Book = require('../model/book.model');
const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only one admin allowed
exports.signup = async (req, res) => {
  const { username, password } = req.body;
  const exists = await Admin.findOne({});
  if (exists) return res.status(403).json({ error: 'Admin already exists' });
  const hash = await bcrypt.hash(password, 10);
  const admin = new Admin({ username, password: hash, role: 'admin' });
  await admin.save();
  res.json({ message: 'Admin created' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

// Category CRUD
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const category = new Category({ name });
  await category.save();
  res.json(category);
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.json({ message: 'Category deleted' });
};

// Book CRUD
exports.createBook = async (req, res) => {
  const { title, author, description, price, discountPrice, category } = req.body;
  const book = new Book({ title, author, description, price, discountPrice, category });
  await book.save();
  res.json(book);
};

exports.getBooks = async (req, res) => {
  const books = await Book.find().populate('category');
  res.json(books);
};

exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const book = await Book.findByIdAndUpdate(id, update, { new: true });
  res.json(book);
};

exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  await Book.findByIdAndDelete(id);
  res.json({ message: 'Book deleted' });
};

// Get users
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// Logout (frontend should remove token)
exports.logout = (req, res) => {
  res.json({ message: 'Logged out' });
};