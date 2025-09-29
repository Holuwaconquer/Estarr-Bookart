import React, { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import axios from 'axios'
import { IoBook } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {toast, ToastContainer} from 'react-toastify'
import { AuthContext } from '../../AuthContext';
import OAuthComponent from '../../components/OAuthComponent';
import PasswordCheck from './PasswordCheck';

const UserLogin = () => { 
  const { authenticated, user, setAuthenticated, authLoading } = useContext(AuthContext)
  const [pwdType, setpwdType] = useState('password')
  useEffect(() => {
    if (!authLoading && authenticated) {
      window.location.assign('/')
    }
  }, [authenticated, authLoading])
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().email('This is not a valid email').required('Email must be provided'),
      password: yup.string().required('Password is required for registration').min(6, 'password must be at least 6 characters long'),
    }),

    onSubmit: (values) =>{
      console.log(values);
      axios.post('http://localhost:5000/user/login', values, { withCredentials:  true})
      .then((res) =>{
        if(res.data.status){
          toast.success('Congratulations! Your have gain access to your account')
          setTimeout(() =>{
            setAuthenticated(true)
            
          }, 2500)
        }
      }).catch((err)=>{
        console.log(err);
        if(err.response?.status === 400){
          toast.error('This email has already been registered')
        }
        if(err.message=='Network Error'){
          toast.error('Network error! cannot connect to server please try again')
        }
      })
    }
  })
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='w-full flex justify-start px-[7%] py-[40px]'>
        <div onClick={() => window.location.href='/'} className='flex items-center gap-2 text-[#515DEF] cursor-pointer'>
          <IoBook size={25}/>
          <h1 className='text-[25px] leading-7 font-extrabold'>Estarr BookArt</h1>
        </div>
      </div>
      <div className='w-full h-full py-[20px] px-[10%] flex flex-col items-center justify-center'>
        <div className='w-full grid md:grid-cols-[50%_50%] items-center justify-center gap-[4rem]'>
          <div className='w-full flex flex-col gap-4 justify-self-end'>
            {/* form */}
            <div className='w-full flex flex-col gap-4'>
              <div>
                <h1 className='text-[40px] text-[#313131] font-semibold'>Login</h1>
                <p className='text-[16px] text-[#313131]'>Login to access your personal account</p>
              </div>
              <form onSubmit={formik.handleSubmit} className='w-full flex flex-col gap-4'>
                {/* for email */}
                <div className='relative'>
                  <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="email">Email</label>
                  <input type="email" onBlur={formik.handleBlur} onChange={formik.handleChange} name='email' placeholder='johndoe@example.com' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                  <small>{formik.touched.email && formik.errors.email}</small>
                </div>
                <div className='w-full grid gap-4'>
                  {/* for firstname */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium z-10' htmlFor="password">Password</label>
                    <div className="relative">
                      <input type={pwdType} onBlur={formik.handleBlur} onChange={formik.handleChange} name='password' placeholder='00000000' className='w-full bg-white border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                      <PasswordCheck pwdType={pwdType} setpwdType={setpwdType}/>
                    </div>
                    <small className='text-red-600'>{formik.touched.password && formik.errors.password}</small>
                  </div>
                </div>
                {/* for agree terms and conditions */}
                <div className='flex gap-2 items-center'>
                  <input type="checkbox" onBlur={formik.handleBlur} onChange={formik.handleChange} name='agree' className='border-2 border-[#313131]'/>
                  <div className='flex items-center justify-between w-full'>
                    <label htmlFor="agree"  className='text-[16px] font-bold'>Remember me</label>
                    <a href='/account/forgot-password' className='coloredTxt'>Forgot Password</a>
                  </div>
                </div>
                <div>
                  <button type='submit' disabled={!formik.isValid || !formik.dirty} className={`w-full rounded-[4px] py-[10px] bg-[#515DEF] text-[#F3F3F3] cursor-pointer ${(!formik.isValid || !formik.dirty) ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}>Login</button>
                </div>
                <p className='text-center text-[#313131] font-medium'>Don’t have an account? <a className='coloredTxt' href="/register">Sign up</a></p>
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
    </div>
  )
}

export default UserLogin