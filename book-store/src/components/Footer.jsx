import React from 'react'
import { IoBook } from "react-icons/io5";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className='w-full bg-[#F1F2EE] flex flex-col gap-4 px-[6%] py-[3%]'>
      <div className='w-full grid md:grid-cols-3 lg:grid-cols-5 gap-5 md:items-start'>
        {/* for contact info and logo */}
        <div className='w-full flex flex-col gap-4'>
          {/* for logo */}
          <div className='flex flex-col gap-2 text-[#435058]'>
            <IoBook size={40}/>
            <h1 className='text-[32px] leading-3 font-extrabold'>Booklet</h1>
          </div>
          {/* for contact info */}
          <div className='flex flex-col gap-2 text-[#435058]'>
            <p className='text-[24px] font-bold'>Contact Info</p>
            <p className='font-bold'>Address: <span className='font-normal text-[#848C8E]'>Lorem Ipsum is simply dummy text</span></p>
            <p className='font-bold'>Call us: <span className='font-normal text-[#848C8E]'> +91 94038XXXXX</span></p>
            <p className='font-bold'>Email us: <span className='font-normal text-[#848C8E]'> support@xyz.in</span></p>
          </div>
          {/* for social link */}
          <div className='flex flex-col gap-2 text-[#435058]'>
            <p className='text-[24px] font-bold'>Follow Us</p>
            <div className='flex items-center gap-2'>
              {/* for facebook */}
              <div className='w-[42px] h-[42px] rounded-[12px] bg-[#DCF763] flex flex-col items-center justify-center border border-[#435058]'>
                <FaFacebook className='text-[24px] text-[#435058]'/>
              </div>
              {/* for x */}
              <div className='w-[42px] h-[42px] rounded-[12px] bg-[#DCF763] flex flex-col items-center justify-center border border-[#435058]'>
                <FaXTwitter className='text-[24px] text-[#435058]'/>
              </div>
              {/* for instagram */}
              <div className='w-[42px] h-[42px] rounded-[12px] bg-[#DCF763] flex flex-col items-center justify-center border border-[#435058]'>
                <FaInstagram className='text-[24px] text-[#435058]'/>
              </div>
              {/* for youtube */}
              <div className='w-[42px] h-[42px] rounded-[12px] bg-[#DCF763] flex flex-col items-center justify-center border border-[#435058]'>
                <FaYoutube className='text-[24px] text-[#435058]'/>
              </div>
            </div>
          </div>
        
        </div>
        {/* for company */}
        <div className='w-full flex flex-col gap-4'>
          <p className='text-[24px] font-bold text-[#435058]'>Company</p>
          <div className='w-full flex flex-col gap-2 text-[22px] font-medium text-[#435058]'>
           <Link to='/about-us'>About Us</Link>
           <Link to='/about-us'>Publisher Partnership</Link>
           <Link to='/about-us'>Contact Us</Link>
           <Link to='/about-us'>Privacy Policy</Link>
           <Link to='/about-us'>Disclaimer</Link>
          </div>
        </div>
        {/* for my account */}
        <div className='w-full flex flex-col gap-4'>
          <p className='text-[24px] font-bold text-[#435058]'>Company</p>
          <div className='w-full flex flex-col gap-2 text-[22px] font-medium text-[#435058]'>
           <Link to='/about-us'>My Orders</Link>
           <Link to='/about-us'>My Addresses</Link>
           <Link to='/about-us'>My Personal Info</Link>
          </div>
        </div>
        {/* for my support */}
        <div className='w-full flex flex-col gap-4'>
          <p className='text-[24px] font-bold text-[#435058]'>Support</p>
          <div className='w-full flex flex-col gap-2 text-[22px] font-medium text-[#435058]'>
           <Link to='/about-us'>Terms of Use</Link>
           <Link to='/about-us'>How to Order</Link>
           <Link to='/about-us'>Shipping Policy</Link>
           <Link to='/about-us'>Return Policy</Link>
          </div>
        </div>
        {/* for more books */}
        <div className='w-full flex flex-col gap-4'>
          <p className='text-[24px] font-bold text-[#435058]'>More Books</p>
          <div className='w-full flex flex-col gap-2 text-[22px] font-medium text-[#435058]'>
           <Link to='/about-us'>Indian Languages</Link>
           <Link to='/about-us'>International Languages</Link>
           <Link to='/about-us'>Award Winning Books</Link>
           <Link to='/about-us'>Frontlist Picks Books</Link>
           <Link to='/about-us'>Used Books</Link>
           <Link to='/about-us'>Exams & Age</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer