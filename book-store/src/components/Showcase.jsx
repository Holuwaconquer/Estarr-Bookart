import React from 'react'
import ImgGirl from '../assets/img-girl.png'
import Book7 from '../assets/book7.png'
import { HiMiniMagnifyingGlass, HiShoppingBag } from "react-icons/hi2";
import { IoMail } from "react-icons/io5";

const Showcase = () => {
  return (
    <div className='w-full flex flex-col items-center py-[40px] showcase'>
      <div className='w-full flex flex-col-reverse md:grid md:grid-cols-2 gap-8 items-center md:justify-center'>
				<div className='w-full flex items-center md:justify-center relative'>
					<img src={ImgGirl} alt="" />
					<img className='absolute bottom-0 md:bottom-auto w-[55%] md:w-auto right-0' src={Book7} alt="" />
				</div>
				{/* for showcae book title */}
				<div className='flex flex-col items-center md:items-start gap-2 md:gap-8'>
					<div>
						<h1 className='text-[46px] md:text-[96px] font-extrabold md:leading-25 text-center md:text-left'>Clive <br className='hidden md:block'/> Cussler</h1>
						<p className='text-[24px] text-[#435058] font-medium text-center md:text-left'>And Boyd Morrison</p>
					</div>
					<div className='flex items-center gap-2 text-[#435058]'>
						<button className='bg-[#F1F2EE] text-[#435058] rounded-[40px] px-[28px] py-[10px] text-[22px] font-bold'>More Info</button>
						<button className='bg-[#DCF763] text-[#435058] rounded-[40px] border border-[#435058] px-[28px] py-[10px] text-[22px] font-bold flex items-center gap-2'><span>Buy Now</span><HiShoppingBag size={30}/></button>
					</div>
				</div>
			</div>
			<div className='w-full max-w-[1100px] mx-auto border border-[#43505838] rounded-[52px] bg-[#f1f2ee80] p-4 sm:p-6 md:p-[30px]'>
				<div className="flex flex-col items-center justify-center gap-6">
						{/* Email input section */}
						<div style={{ background: 'linear-gradient(to right, #F2F4D1, #FFFEE9, #EEFFF4)' }}
							className='w-full max-w-[700px] mx-auto px-3 py-2 sm:px-[18px] sm:py-[10px] rounded-[40px] flex flex-row items-center gap-3 text-[18px] text-[#848C8E] font-medium'>

							<HiMiniMagnifyingGlass className='text-[28px] sm:text-[32px] text-[#28303F]' />

							<input
								type="text"
								placeholder='Search'
								className='outline-0 flex-1 w-full min-w-0 bg-transparent text-base sm:text-[18px]'
							/>

							<button className='sm:w-auto bg-[#28303F] rounded-[40px] border border-[#435058] py-2 px-10 text-[#F1F2EE] text-[18px] sm:text-[24px] font-bold'>
								Search
							</button>
						</div>

					</div>
				</div>
    </div>
  )
}

export default Showcase