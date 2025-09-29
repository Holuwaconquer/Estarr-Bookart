import React, { useContext, useEffect } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import axios from 'axios'
import { IoBook } from "react-icons/io5";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {toast, ToastContainer} from 'react-toastify'
import { AuthContext } from '../../AuthContext';
import OAuthComponent from '../../components/OAuthComponent';

const UserSignup = () => {
  const { authenticated, authLoading } = useContext(AuthContext)
  useEffect(() => {
    if (!authLoading && authenticated) {
      window.location.assign('/')
    }
  }, [authenticated, authLoading])

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      phonenumber: '',
      password: '',
      confirmpassword: '',
      agree: false
    },
    validationSchema: yup.object().shape({
      firstname: yup.string().required('This field is required'),
      lastname: yup.string().required('This field is required'),
      email: yup.string().email('This is not a valid email').required('Email must be provided'),
      phonenumber: yup.string().required('Phone number is required'),
      password: yup.string().required('Password is required for registration').min(6, 'password must be at least 6 characters long'),
      confirmpassword: yup.string().oneOf([yup.ref('password')], "password must match").required('please confirm your password'),
      agree: yup.boolean().oneOf([true], 'you must accept the terms and conditions')
    }),

    onSubmit: (values) =>{
      console.log(values);
      axios.post('http://localhost:5000/user/signup', values)
      .then((res) =>{
        console.log(res);
        if(res.data.status){
          toast.success('Congratulations! Your account has been created successfully')
          setTimeout(() =>{
            window.location.href = '/login'
          }, 3000)
        }
      }).catch((err)=>{
        console.log(err);
        if(err.status === 400){
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
      <div className='w-full px-[10%] py-[20px] flex flex-col'>
        <div className='w-full grid md:grid-cols-[50%_50%] justify-center gap-[4rem]'>
          <div className='w-full rounded-[30px] bg-[#D9D9D9] flex flex-col items-center justify-center'>
            <DotLottieReact
              src="https://lottie.host/f50117ee-434a-45f2-b4d5-650064ff9bd3/cPgO2P5U4N.lottie"
              loop
              autoplay
              className='w-auto h-full'
            />
          </div>
          <div className='w-full flex flex-col gap-4 justify-self-end'>
            <div className='w-full flex flex-col gap-4'>
              <div>
                <h1 className='text-[40px] text-[#313131] font-semibold'>Sign up</h1>
                <p className='text-[16px] text-[#313131]'>let's get you set up so you can access your personal account and start making purchases</p>
              </div>
              <form onSubmit={formik.handleSubmit} className='w-full flex flex-col gap-4'>
                <div className='w-full grid md:grid-cols-2 gap-4'>
                  {/* for firstname */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="firstname">First Name</label>
                    <input type="text" onBlur={formik.handleBlur} onChange={formik.handleChange} name='firstname' placeholder='John' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                    <small>{formik.touched.firstname && formik.errors.firstname}</small>
                  </div>
                  {/* for lastname */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="lastname">Last Name</label>
                    <input type="text" onBlur={formik.handleBlur} onChange={formik.handleChange} name='lastname' placeholder='Doe' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                    <small>{formik.touched.lastname && formik.errors.lastname}</small>
                  </div>
                  {/* for email */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="email">Email</label>
                    <input type="email" onBlur={formik.handleBlur} onChange={formik.handleChange} name='email' placeholder='johndoe@example.com' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                    <small>{formik.touched.email && formik.errors.email}</small>
                    
                  </div>
                  {/* for phone number */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="phonenumber">Phone Number</label>
                    <input type="text" onBlur={formik.handleBlur} onChange={formik.handleChange} name='phonenumber' placeholder='000000000' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                  </div>
                </div>
                <div className='w-full grid gap-4'>
                  {/* for firstname */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="password">Password</label>
                    <input type="password" onBlur={formik.handleBlur} onChange={formik.handleChange} name='password' placeholder='00000000' className='w-full bg-white border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                  </div>
                  {/* for lastname */}
                  <div className='relative'>
                    <label className='bg-white absolute top-[-10px] left-5 px-2 text-[16px] text-[#1C1B1F] font-medium' htmlFor="confirmpassword">Confirm Password</label>
                    <input type="password" onBlur={formik.handleBlur} onChange={formik.handleChange} name='confirmpassword' placeholder='000000' className='w-full border border-[#79747E] rounded-[4px] p-4 text-[#1C1B1F] outline-0'/>
                  </div>
                </div>
                {/* for agree terms and conditions */}
                <div className='flex gap-2 items-center'>
                  <input type="checkbox" onBlur={formik.handleBlur} onChange={formik.handleChange} name='agree' className='border-2 border-[#313131]'/>
                  <label htmlFor="agree"  className='text-[16px] font-bold'><span>I agree to all the <span className='coloredTxt'>Terms </span>and <span className='coloredTxt'>Privacy Policies</span> </span></label>
                </div>
                <div>
                  <button type='submit' disabled={!formik.isValid || !formik.dirty} className={`w-full rounded-[4px] py-[10px] bg-[#515DEF] text-[#F3F3F3] cursor-pointer ${(!formik.isValid || !formik.dirty) ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}>Create Account</button>
                </div>
                <p className='text-center text-[#313131] font-medium'>Already have an account? <a className='coloredTxt' href="/login">Login</a></p>
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
        </div>
        <ToastContainer />
      </div>
      
    </div>
  )
}

export default UserSignup