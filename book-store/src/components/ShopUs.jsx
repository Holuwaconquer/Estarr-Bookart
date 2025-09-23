import React from 'react';

const ShopUs = () => {
  return (
    <div className='m-4 lg:m-0'>
      <div className='w-full shopUs px-[6%] py-[100px] lg:flex lg:flex-row'>
        <div className='w-full lg:w-[40%] flex flex-col gap-4 text-center items-center justify-center ml-auto'>
          <h1 className='text-[26px] md:text-[42px] font-bold'>Why Shop with Us?</h1>
          <p className='text-[#435058] text-[18px] md:text-[22px] font-medium'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
          </p>
          <button className='text-[#DCF763] rounded-[40px] border border-[#435058] hover:bg-transparent hover:text-[#435058] cursor-pointer transition-all bg-[#435058] text-[20px] md:text-[24px] font-bold px-[19px] py-[5px] md:px-[40px] md:py-[15px]'>
            Read More
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShopUs;
