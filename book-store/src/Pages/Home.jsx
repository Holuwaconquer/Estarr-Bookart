import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import RightReserved from '../components/RightReserved'
import Newsletter from '../components/Newsletter'
import ShopUs from '../components/ShopUs'
import Navbar from '../components/Navbar'
import Showcase from '../components/Showcase'

const Home = () => {
  return (
    <div>
        <Navbar />
        <Showcase />
        <Outlet />
        <ShopUs />
        <Newsletter />
        <Footer />
        <RightReserved />
    </div>
  )
}

export default Home