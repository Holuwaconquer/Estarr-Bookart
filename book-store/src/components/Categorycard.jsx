import React from 'react'

const Categorycard = () => {
  return (
    <div className='w-full bg-[#F1F2EE] rounded-[24px] p-[14px] flex items-center justify-center gap-4'>
      <div className='w-[42px] h-[42px] bg-[#28303F]'></div>
      <div className='leading-7'>
        <p className='text-[#435058] text-[22px] font-extrabold'>Non Fiction</p>
        <p className='text-[#848C8E] text-[18px]'>302 items</p>
      </div>
    </div>
  )
}

export default Categorycard