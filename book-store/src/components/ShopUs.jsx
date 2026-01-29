import React from 'react';
import Bookcard from './Bookcard';
import Book1 from '../assets/book1.png'
import Book2 from '../assets/book2.png'
import Book3 from '../assets/book3.png'

const sampleBooks = [
  { id: 1, image: Book1, title: 'The Silent Sea', author: 'Clive Cussler', price: '14.99', rating: 4.6, description: 'A thrilling aquatic adventure with danger at every turn.' },
  { id: 2, image: Book2, title: 'Lost Horizon', author: 'James Hilton', price: '11.50', rating: 4.2, description: 'A classic tale exploring the mysterious valley of Shangri-La.' },
  { id: 3, image: Book3, title: 'Deep Waters', author: 'Boyd Morrison', price: '16.00', rating: 4.8, description: 'High-octane suspense and a dive into forgotten secrets.' },
]

const ShopUs = () => {
  const handleAdd = (book) => {
    // placeholder for add-to-cart integration
    console.log('Add to cart', book)
  }

  return (
    <div className='m-4 lg:m-0'>
      <div className='w-full shopUs px-[6%] py-[60px]'>
        <div className='max-w-[1200px] mx-auto'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-center mb-6'>Featured Books</h2>
          <p className='text-center text-[#435058] max-w-[900px] mx-auto mb-8'>Discover curated picks hand-selected for quality, storytelling and design — crafted for readers who love beautiful books.</p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {sampleBooks.map(b => (
              <div key={b.id} className='flex justify-center'>
                <Bookcard book={b} onAddToCart={handleAdd} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopUs;
