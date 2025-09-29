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

const ForgotPassword = () => { 
  const { authenticated, user, setAuthenticated, authLoading } = useContext(AuthContext)
  useEffect(() => {
    if (!authLoading && authenticated) {
      window.location.assign('/')
    }
  }, [authenticated, authLoading])
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().email('This is not a valid email').required('Email must be provided'),
    }),

    onSubmit: (values) =>{
      console.log(values);
      axios.post('http://localhost:5000/user/forgot-password', values)
      .then((res) =>{
        if(res.data.status){
          toast.success("Password reset link sent to your email!")
           setTimeout(() => {
            navigate('/account/verify-code', {state: {email: values.email }});
          }, 1500);
        }
      }).catch((err)=>{
        if(err.status==404){
          toast.error("This email is not registered")
        }
      })
    }
  })
  return (
    <div className='w-full h-full py-[40px] px-[10%] flex flex-col items-center justify-center'>
      <div className='w-full grid md:grid-cols-[50%_50%] items-center justify-center gap-[4rem]'>
        <div className='w-full flex flex-col gap-4 justify-self-end'>
          {/* for logo */}
          <div className='flex'>
            <div onClick={() => window.location.href='/'} className='flex items-center gap-2 text-[#515DEF]'>
              <IoBook size={40}/>
              <h1 className='text-[32px] leading-7 font-extrabold'>Estarr BookArt</h1>
            </div>
          </div>
          {/* form */}
          <div className='w-full flex flex-col gap-4'>
            <div>
              <div onClick={() => window.location.href='/login'} className='text-[#313131] flex items-center cursor-pointer'>
                <IoIosArrowBack size={24}/>
                <p className='text-[14px] font-medium'>Back to login</p>
              </div>
              <h1 className='text-[40px] text-[#313131] font-semibold'>Forgot Password?</h1>
              <p className='text-[16px] text-[#313131]'>Don’t worry, happens to all of us. Enter your email below to recover your password</p>
            </div>
            <form onSubmit={formik.handleSubmit} className='w-full flex flex-col gap-4'>
              {/* for email */}
              <div className='relative'>
                <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="email">Email</label>
                <input type="email" onBlur={formik.handleBlur} onChange={formik.handleChange} name='email' placeholder='johndoe@example.com' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                <small className='text-red-600'>{formik.touched.email && formik.errors.email}</small>
              </div>
              <div>
                <button type='submit' disabled={!formik.isValid || !formik.dirty} className={`w-full rounded-[4px] py-[10px] bg-[#515DEF] text-[#F3F3F3] cursor-pointer ${(!formik.isValid || !formik.dirty) ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}>Submit</button>
              </div>
            </form>
            <div className='w-full flex flex-col gap-8'>
              <div className='w-full flex items-center gap-4'>
                <span className='h-[0.5px] w-[40%] bg-[#313131]'></span>
                <span>Or Sign up with</span>
                <span className='h-[0.5px] w-[40%] bg-[#313131]'></span>
              </div>
              <OAuthComponent />
            </div>
          </div>
        </div>
        <div className='w-full h-full rounded-[30px] bg-[#D9D9D9] flex flex-col items-center justify-center'>
          <DotLottieReact
            src="https://lottie.host/645bd343-126f-47af-bdbf-8c6423539d46/htMDuHmwiu.lottie"
            loop
            autoplay
          />
        </div>
        
      </div>
      <ToastContainer />
    </div>
  )
}

export default ForgotPassword