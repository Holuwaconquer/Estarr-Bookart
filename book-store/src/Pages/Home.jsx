import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import RightReserved from '../components/RightReserved'
import Newsletter from '../components/Newsletter'

import Navbar from '../components/Navbar'


const Home = () => {
  return (
    <div>
        <Navbar />
        <Outlet />
        <Newsletter />
        <Footer />
        <RightReserved />
    </div>
  )
}

export default Home