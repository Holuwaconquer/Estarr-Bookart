import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCanonicalUrl from '../../useCanonicalUrl';

const BrandPage = () => {
    useCanonicalUrl()
  useEffect(() => {
    document.title = "About Estarr Bookart - Also Known as Esther Bookart | EStarr Bookart Hub";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Estarr Bookart (also known as Esther Bookart or EStarr Bookart Hub) is Nigeria's premier bookstore founded by Esther Adeleke. Quality books, free delivery across Nigeria.");
    }
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About Estarr Bookart (Esther Bookart)
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-6">
              <strong>Estarr Bookart</strong> (also known as <strong>Esther Bookart</strong> or <strong>EStarr Bookart Hub</strong>) is Nigeria's premier online bookstore, founded by Esther Adeleke.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Who is Estarr Bookart?</h2>
            <p>
              Estarr Bookart (Esther Bookart) is a passion project turned into Nigeria's most trusted bookstore. 
              Founded by Esther Adeleke, the brand has grown to become a hub for book lovers across Nigeria, 
              particularly with strong connections to Obafemi Awolowo University (OAU), Ile-Ife.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Choose Estarr Bookart?</h2>
            <ul>
              <li>Quality authentic books from trusted publishers</li>
              <li>Free delivery across Nigeria on orders over ₦5,000</li>
              <li>Wide selection of fiction, non-fiction, educational books</li>
              <li>Affordable prices with regular discounts</li>
              <li>Excellent customer service</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Connect With Us</h2>
            <p>
              Follow Estarr Bookart (Esther Bookart) on social media:
            </p>
            <ul>
              <li>Instagram: <a href="https://instagram.com/estarrbookart.hubafrika" target="_blank" rel="noopener noreferrer">@estarrbookart.hubafrika</a></li>
              <li>Threads: <a href="https://threads.net/@i_am_jaszi" target="_blank" rel="noopener noreferrer">@i_am_jaszi</a></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandPage;