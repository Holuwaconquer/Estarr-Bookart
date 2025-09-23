import React from 'react'

const RightReserved = () => {
    const date = new Date();
    const year = date.getFullYear();
  return (
    <div className='w-full bg-[#4350582b] p-4 flex flex-col items-center justify-center'>
        <p className='text-[18px] text-[#435058]'>All Right Reserved. Copyright © {year}</p>
    </div>
  )
}

export default RightReserved