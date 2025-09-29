import React from 'react'
import { NavLink } from 'react-router-dom';
import { IoBook } from "react-icons/io5";
import { HiOutlineUserCircle, HiShoppingBag } from "react-icons/hi2";
import { FiMenu } from "react-icons/fi";

const Navbar = () => {
  return (
    <div className='w-full py-[10px] md:py-[22px] px-[6%] flex justify-between items-center'>
      <div className='flex items-center gap-2 text-[#435058]'>
        <IoBook size={40}/>
        <h1 className='text-[32px] leading-7 font-extrabold'>Estarr BookArt</h1>
      </div>
      {/* for center nav */}
      <div className=' gap-4 items-center hidden lg:flex'>
        <NavLink to='/' className={({ isActive }) => `cursor-pointer flex gap-[8px] items-center text-[20px] font-bold ${isActive ? "text-[#DCF763] bg-[##DCF763] font-semibold rounded-[40px] py-[8px] px-[24px]" : "text-[#435058] hover:text-[#b7df04] transition-all"}`}>
          Home
        </NavLink>
        <NavLink to='/category' className={({ isActive }) => `cursor-pointer flex gap-[8px] items-center text-[20px] font-bold ${isActive ? "text-[#DCF763] bg-[#435058] font-semibold rounded-[40px] py-[8px] px-[24px]" : "text-[#435058] hover:text-[#b7df04] transition-all"}`}>
          Category
        </NavLink>
        <NavLink to='/category/new-arrivals' className={({ isActive }) => `cursor-pointer flex gap-[8px] items-center text-[20px] font-bold ${isActive ? "text-[#DCF763] bg-[#435058] font-semibold rounded-[40px] py-[8px] px-[24px]" : "text-[#435058] hover:text-[#b7df04] transition-all"}`}>
          New Arrivals
        </NavLink>
        <NavLink to='/category/Best-Selling-Books' className={({ isActive }) => `cursor-pointer flex gap-[8px] items-center text-[20px] font-bold ${isActive ? "text-[#DCF763] bg-[#435058] font-semibold rounded-[40px] py-[8px] px-[24px]" : "text-[#435058] hover:text-[#b7df04] transition-all"}`}>
          Best Selling Books
        </NavLink>
        <NavLink to='/category/contact-us' className={({ isActive }) => `cursor-pointer flex gap-[8px] items-center text-[20px] font-bold ${isActive ? "text-[#DCF763] bg-[#435058] font-semibold rounded-[40px] py-[8px] px-[24px]" : "text-[#435058] hover:text-[#b7df04] transition-all"}`}>
          Contact Us
        </NavLink>
      </div>
      {/* for action btn */}
      <div className='flex items-center gap-2 text-[#435058]'>
        <button className='w-[52px] h-[52px] rounded-[50%] flex flex-col items-center justify-center bg-[#435058] text-[#DCF763]'><HiShoppingBag size={30}/></button>
        <FiMenu className='text-[34px] text-[#28303F] cursor-pointer md:hidden' />
        <button className='bg-[#DCF763] hidden md:flex text-[#435058] rounded-[40px] border border-[#435058] px-[28px] py-[10px] text-[22px] font-bold items-center gap-2'><span>Sign In</span><HiOutlineUserCircle size={28}/></button>
      </div>
    </div>
  )
}

export default Navbar