import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Homepage from './pages/Homepage'





function App() {

  return (
    <>

      <Routes>
        <Route path='/' element={<Homepage />} />



      </Routes>
    </>
  )
}

export default App
