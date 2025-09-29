import React from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
const PasswordCheck = ({ pwdType, setpwdType}) => {
  return (
    <>
      {pwdType==='password' ? 
        <FaRegEye onClick={() => setpwdType('text')} className='absolute top-[50%] right-5 translate-y-[-50%] cursor-pointer text-[24px]'/> 
        : <FaRegEyeSlash onClick={() => setpwdType('password')} className='absolute top-[50%] right-5 translate-y-[-50%] cursor-pointer text-[24px]'/> 
      }
    </>
  )
}

export default PasswordCheck