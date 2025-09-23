import React from 'react';
import Img from '../assets/img.png';
import { IoMail } from "react-icons/io5";

const Newsletter = () => {
  return (
    <div className='w-full clipPath py-[5%] px-[6 flex flex-col justify-center items-center'>
      <div className='w-full max-w-[1100px] border border-[#43505838] rounded-[52px] bg-[#f1f2ee80] p-4 sm:p-6 md:p-[30px]'>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-6">
          
          {/* Image */}
          <div className='w-full'>
            <img src={Img} alt="Newsletter" className='w-full h-auto object-contain' />
          </div>

          {/* Text + Form */}
          <div className='w-full flex flex-col gap-4 leading-6'>
            <h1 className='text-[28px] sm:text-[36px] md:text-[42px] font-bold'>
              Join News Letter
            </h1>
            <p className='text-[16px] sm:text-[18px] font-medium text-[#435058]'>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>

            {/* Email input section */}
            <div style={{ background: 'linear-gradient(to right, #FFFEE9, #EEFFF4)' }}
              className='w-full px-3 py-2 sm:px-[18px] sm:py-[10px] rounded-[40px] flex flex-row items-center gap-3 text-[18px] text-[#848C8E] font-medium'>

              <IoMail className='text-[28px] sm:text-[32px] text-[#28303F]' />

              <input
                type="text"
                placeholder='Enter your email address'
                className='outline-0 flex-1 w-full min-w-0 bg-transparent text-base sm:text-[18px]'
              />

              <button className='sm:w-auto bg-[#DCF763] rounded-[40px] border border-[#435058] py-3 px-6 text-[#435058] text-[18px] sm:text-[24px] font-bold'>
                Subscribe
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
