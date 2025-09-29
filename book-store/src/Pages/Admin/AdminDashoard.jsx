import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSideNav from './adminComponent/AdminSideNav';

const API = import.meta.env.VITE_API_URL;
const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE;

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [catName, setCatName] = useState('');
  const [bookForm, setBookForm] = useState({
    title: '', author: '', description: '', price: '', discountPrice: '', category: ''
  });

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const catRes = await axios.get(`${API}/${ADMIN_ROUTE}/category`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(catRes.data);
      const bookRes = await axios.get(`${API}/${ADMIN_ROUTE}/book`, { headers: { Authorization: `Bearer ${token}` } });
      setBooks(bookRes.data);
      const userRes = await axios.get(`${API}/${ADMIN_ROUTE}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(userRes.data);
    } catch (err) {
      // handle error (e.g., unauthorized)
    }
  };

  // Category CRUD
  const addCategory = async () => {
    if (!catName) return;
    await axios.post(`${API}/${ADMIN_ROUTE}/category`, { name: catName }, { headers: { Authorization: `Bearer ${token}` } });
    setCatName('');
    fetchAll();
  };
  const updateCategory = async (id, name) => {
    if (!name) return;
    await axios.put(`${API}/${ADMIN_ROUTE}/category/${id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };
  const deleteCategory = async (id) => {
    await axios.delete(`${API}/${ADMIN_ROUTE}/category/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  // Book CRUD
  const addBook = async () => {
    if (!bookForm.title || !bookForm.author || !bookForm.price || !bookForm.category) return;
    await axios.post(`${API}/${ADMIN_ROUTE}/book`, bookForm, { headers: { Authorization: `Bearer ${token}` } });
    setBookForm({ title: '', author: '', description: '', price: '', discountPrice: '', category: '' });
    fetchAll();
  };
  const updateBook = async (id, update) => {
    await axios.put(`${API}/${ADMIN_ROUTE}/book/${id}`, update, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };
  const deleteBook = async (id) => {
    await axios.delete(`${API}/${ADMIN_ROUTE}/book/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNav />
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h2>
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Categories</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder="New Category"
              className="border rounded px-3 py-2 w-64"
            />
            <button
              onClick={addCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Category
            </button>
          </div>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat._id} className="flex items-center justify-between bg-white rounded shadow px-4 py-2">
                <span>{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newName = prompt('New name:', cat.name);
                      if (newName) updateCategory(cat._id, newName);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Title"
              value={bookForm.title}
              onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Author"
              value={bookForm.author}
              onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Description"
              value={bookForm.description}
              onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Price"
              type="number"
              value={bookForm.price}
              onChange={e => setBookForm({ ...bookForm, price: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Discount Price"
              type="number"
              value={bookForm.discountPrice}
              onChange={e => setBookForm({ ...bookForm, discountPrice: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <select
              value={bookForm.category}
              onChange={e => setBookForm({ ...bookForm, category: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <button
            onClick={addBook}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          >
            Add Book
          </button>
          <ul className="space-y-2">
            {books.map(book => (
              <li key={book._id} className="flex items-center justify-between bg-white rounded shadow px-4 py-2">
                <span>
                  <span className="font-semibold">{book.title}</span> by {book.author} (${book.price}) [{book.category?.name}]
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newTitle = prompt('New title:', book.title);
                      if (newTitle) updateBook(book._id, { ...book, title: newTitle });
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBook(book._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Users</h3>
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u._id} className="bg-white rounded shadow px-4 py-2">{u.username}</li>
            ))}
          </ul>
        </section>
        <button
          onClick={() => { localStorage.removeItem('adminToken'); window.location.reload(); }}
          className="mt-8 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

export default AdminDashboard;