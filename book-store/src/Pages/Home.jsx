import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import RightReserved from '../components/RightReserved'
import Navbar from '../components/Navbar'
import PromoBar, { PromoBarContext } from '../components/PromoBar'

const Home = () => {
  const [isPromoBarVisible, setIsPromoBarVisible] = useState(true);

  return (
    <PromoBarContext.Provider value={{ isPromoBarVisible, setPromoBarVisible: setIsPromoBarVisible }}>
      <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white transition-all duration-300 ${isPromoBarVisible ? 'pt-[40px]' : 'pt-[40px'}`}>
        {/* Promotional banner before navbar */}
        <PromoBar />
        
        {/* Your existing Navbar component */}
        <Navbar />

        <div className='md:hidden flex bg-gradient-to-r py-2 px-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 md:flex-row flex-wrap items-center justify-center mb-2'>
          <p className='text-white text-[14px] font-bold text-center'>CALL TO ORDER: +234 814 515 7410</p>
        </div>
        {/* Main content area */}
        <main>
          <Outlet />
        </main>
        
        {/* Your existing Footer components */}
        <Footer />
        <RightReserved />
      </div>
    </PromoBarContext.Provider>
  )
}

export default Home