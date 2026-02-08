import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext.jsx'
import AuthProvider from './AuthContext.jsx'
import App from './App.jsx'
import './index.css'
import { WishlistProvider } from './contexts/WishlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
            <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: 'white',
                  color: '#1f2937',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)