import React from 'react'
import Categorycard from './components/Categorycard'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Landingpage from './Pages/Landingpage'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashoard'
import UserLogin from './Pages/User/UserLogin'
import UserSignup from './Pages/User/UserSignup'
import ForgotPassword from './Pages/User/ForgotPassword'
import ResetPassword from './Pages/User/ResetPassword'
import PasswordReset from './Pages/User/PasswordReset'

const App = () => {
  const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}>
          <Route index element={<Landingpage />} />
        </Route>
          <Route path='/login' element={<UserLogin />} />
          <Route path='/register' element={<UserSignup />} />
          <Route path='/account/forgot-password' element={<ForgotPassword />} />
          <Route path='/account/verify-code' element={<ResetPassword />} />
          <Route path='/account/reset-password' element={<PasswordReset />} />
        <Route path={`/${ADMIN_ROUTE}/login`} element={<AdminLogin />} />
        <Route path={`/${ADMIN_ROUTE}/dashboard`} element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default App