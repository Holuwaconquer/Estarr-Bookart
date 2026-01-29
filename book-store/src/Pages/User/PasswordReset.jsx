import React, { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import api from '../../services/api'
import { IoBook } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {toast, ToastContainer} from 'react-toastify'
import { AuthContext } from '../../AuthContext';
import OAuthComponent from '../../components/OAuthComponent';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import PasswordCheck from './PasswordCheck';


const PasswordReset = () => { 
  const { authenticated, user, setAuthenticated, authLoading, reloadProfile } = useContext(AuthContext)
  const [loginProcessing, setloginProcessing] = useState(false)
  const [pwdType, setpwdType] = useState('password')
  const [pwdType2, setpwdType2] = useState('password')
  const location = useLocation()
  const { email, code, token } = location.state || {};
  useEffect(() => {
    if (!authLoading && authenticated) {
      window.location.assign('/')
    }
  }, [authenticated, authLoading])
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      password: '',
      password2: '',
    },
    validationSchema: yup.object().shape({
      password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      password2: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),

    onSubmit: async (values) =>{
      setloginProcessing(true)
      try {
        const usedToken = token || values.code;
        if (!usedToken) {
          toast.error('No reset token provided');
          navigate('/account/forgot-password');
          return;
        }
        await api.userAPI.resetPassword(usedToken, values.password);
        toast.success('Password reset successfully!');
        setTimeout(() => navigate('/login'), 1200);
      } catch (err) {
        console.error('an error occured while changing password: ', err);
        toast.error('Failed to reset password');
      } finally {
        setloginProcessing(false)
      }
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
        <div className='w-full grid md:grid-cols-[50%_50%] items-center justify-center md:gap-[4rem]'>
          <div className='w-full flex flex-col gap-4 justify-self-end'>
            {/* form */}
            <div className='w-full flex flex-col gap-4'>
              <div>
                <h1 className='text-[30px] md:text-[40px] text-[#313131] font-semibold'>Set a password</h1>
                <p className='text-[16px] text-[#313131]'>Your previous password has been reseted. Please set a new password for your account.</p>
              </div>
              <form onSubmit={formik.handleSubmit} className='w-full flex flex-col gap-4'>
                {/* for password */}
                <div className='relative'>
                  <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium z-10' htmlFor="email">Create Password</label>
                  <div className='relative'>
                    <input type={pwdType} onBlur={formik.handleBlur} onChange={formik.handleChange} name='password' placeholder='password' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                    <PasswordCheck pwdType={pwdType} setpwdType={setpwdType}/>
                  </div>
                  <small className='text-red-600'>{formik.touched.password && formik.errors.password}</small>
                </div>
                {/* for password */}
                <div className='relative'>
                  <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium z-10' htmlFor="email">Re-enter Password</label>
                  <div className='relative'>
                    <input type={pwdType2} onBlur={formik.handleBlur} onChange={formik.handleChange} name='password2' placeholder='password' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                    <PasswordCheck pwdType={pwdType2} setpwdType={setpwdType2}/>
                  </div>
                  <small className='text-red-600'>{formik.touched.password2 && formik.errors.password2}</small>
                </div>
                <div>
                  <button type='submit' disabled={ !formik.isValid || !formik.dirty || loginProcessing } className={`w-full rounded-[4px] py-[10px] bg-[#515DEF] text-[#F3F3F3] cursor-pointer ${( !formik.isValid || !formik.dirty || loginProcessing ) ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}>{ loginProcessing ? 'creating new password...' : 'Set Password' }</button>
                </div>
              </form>
              <div className='w-full flex flex-col gap-8'>
                <div className='w-full flex items-center gap-4'>
                  <span className='h-[0.5px] w-[40%] bg-[#313131]'></span>
                  <span className='text-center'>Or Sign up with</span>
                  <span className='h-[0.5px] w-[40%] bg-[#313131]'></span>
                </div>
                <OAuthComponent />
              </div>
            </div>
          </div>
          <div className='w-full h-full hidden rounded-[30px] bg-[#D9D9D9] md:flex flex-col items-center justify-center'>
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

export default PasswordReset