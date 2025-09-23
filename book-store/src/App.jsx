import React from 'react'
import Categorycard from './components/Categorycard'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Landingpage from './Pages/Landingpage'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}>
          <Route index element={<Landingpage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App