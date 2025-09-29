import React, { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import axios from 'axios'
import { IoBook } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {toast, ToastContainer} from 'react-toastify'
import { AuthContext } from '../../AuthContext';
import OAuthComponent from '../../components/OAuthComponent';
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const ResetPassword = () => { 
  const { authenticated, user, setAuthenticated, authLoading } = useContext(AuthContext)
  const location = useLocation()
  const { email } = location.state || {};
  useEffect(() => {
    if (!authLoading && authenticated) {
      window.location.assign('/')
    }
  }, [authenticated, authLoading])
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      code: '',
    },
    validationSchema: yup.object().shape({
      code: yup.string()
    .required('Reset code is required')
    .matches(/^\d{6}$/, 'Code must be exactly 6 digits'),
    }),

    onSubmit: (values) =>{
      console.log(values.code, email);
      if(!email){
        toast.error("No email provided for verification")
        setTimeout(() => {
          navigate('/account/forgot-password');
        }, 1500);
        return;
      }
      axios.post('http://localhost:5000/user/verify-reset-code', {code: values.code, email})
      .then((res) =>{
        if(res.data.status){
          toast.success("Code verified! You can now reset your password.")
           setTimeout(() => {
            navigate('/account/reset-password', { state: {email: email, code: values.code } } );
          }, 1500);
        }
      }).catch((err)=>{
        if(err.status==400 && err.response.data.message=='Invalid request'){
          toast.error("Invalid request, please go back and try again!")
        }
        if(err.status==404 && err.response.data.message=='Invalid code'){
          toast.error("Invalid code, please input the correct code  !")
        }
        console.log(err);
        
      })
    }
  })
  return (
    <div className='w-full h-full flex flex-col'>
        {/* for logo */}
      <div className='w-full flex justify-start px-[7%] py-[40px]'>
        <div onClick={() => window.location.href='/'} className='flex items-center gap-2 text-[#515DEF] cursor-pointer'>
          <IoBook size={25}/>
          <h1 className='text-[25px] leading-7 font-extrabold'>Estarr BookArt</h1>
        </div>
      </div>
      <div className='w-full h-full py-[20px] px-[10%] flex flex-col gap-8'>
        <div className='w-full grid md:grid-cols-[50%_50%] items-center justify-center gap-[4rem]'>
          <div className='w-full flex flex-col gap-4 justify-self-end'>
            {/* form */}
            <div className='w-full flex flex-col gap-4'>
              <div>
                <div onClick={() => window.location.href='/login'} className='text-[#313131] flex items-center cursor-pointer'>
                  <IoIosArrowBack size={24}/>
                  <p className='text-[14px] font-medium'>Back to login</p>
                </div>
                <h1 className='text-[40px] text-[#313131] font-semibold'>Verify Code</h1>
                <p className='text-[16px] text-[#313131]'>An authentication code has been sent to your email.</p>
              </div>
              <form onSubmit={formik.handleSubmit} className='w-full flex flex-col gap-4'>
                {/* for email */}
                <div className='relative'>
                  <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="email">Enter Code</label>
                  <input type="tel" onBlur={formik.handleBlur} onChange={formik.handleChange} name='code' placeholder='Enter your six digit code' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                  <small className='text-red-600'>{formik.touched.code && formik.errors.code}</small>
                </div>
                <div>
                  <button type='submit' disabled={!formik.isValid || !formik.dirty} className={`w-full rounded-[4px] py-[10px] bg-[#515DEF] text-[#F3F3F3] cursor-pointer ${(!formik.isValid || !formik.dirty) ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}>Verify</button>
                </div>
              </form>
              <div className='w-full flex flex-col gap-8'>
                <div className='w-full flex items-center gap-4'>
                  <span className='h-[0.5px] w-[40%] bg-[#313131]'></span>
                  <span className='w-auto'>Or Sign up with</span>
                  <span className='h-[0.5px] w-[40%] bg-[#313131]'></span>
                </div>
                <OAuthComponent />
              </div>
            </div>
          </div>
          <div className='w-full h-full rounded-[30px] bg-[#D9D9D9] flex flex-col items-center justify-center'>
            <DotLottieReact
              src="https://lottie.host/cf8f94bf-4913-4654-9f10-283bf544782e/Xvpqa4Sop5.lottie"
              loop
              autoplay
            />
          </div>
          
        </div>
        <ToastContainer />
      </div>
    </div>
  )
}

export default ResetPassword