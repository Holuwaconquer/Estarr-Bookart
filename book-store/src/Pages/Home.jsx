import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import RightReserved from '../components/RightReserved'
import Navbar from '../components/Navbar'

const Home = () => {

  return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-300'>
        {/* Promotional banner before navbar */}
        {/* <PromoBar /> */}
        
        {/* Your existing Navbar component */}
        <Navbar />

        <div className='flex flex-col text-white py-6 px-4 md:flex-row flex-wrap items-center justify-center relative overflow-hidden'>
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url('/estarr.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Gradient Overlay (combining your original gradient with the image) */}
          <div className="absolute inset-0 z-1 bg-gradient-to-r from-red-500/80 to-orange-500/80" />
          
          {/* Content */}
          <div className="relative z-10 text-center">
            <h1 className='text-2xl font-bold'>Building readers</h1>
            <p className='font-semibold text-[18px]'>Estarr BookArt Online Store</p>
          </div>
        </div>
        {/* Main content area */}
        <main>
          <Outlet />
        </main>
        
        {/* Your existing Footer components */}
        <Footer />
        <RightReserved />
      </div>
  )
}

export default Home