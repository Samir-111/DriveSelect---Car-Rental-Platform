import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './components/Login'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetails'
import MyBooking from './pages/MyBooking'
import Layout from './pages/Owner/Layout'
import Dashboard from './pages/Owner/Dashboard'
import AddCar from './pages/Owner/Addcar'
import ManageCars from './pages/Owner/ManageCars'
import ManageBookings from './pages/Owner/ManageBookings'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const App = () => {
  const { showLogin } = useAppContext()
  const isOwnerPath = useLocation().pathname.startsWith('/owner')

  return (
    <div className='min-h-screen flex flex-col justify-between'>
      <Toaster />
      <div>
        {showLogin && <Login />}
        {!isOwnerPath && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/car-details/:id" element={<CarDetail />} />
          <Route path="/CarDetail/:id" element={<CarDetail />} />
          <Route path="/my-booking" element={<MyBooking />} />
          <Route path="/my-bookings" element={<MyBooking />} />
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="manage-cars" element={<ManageCars />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
          </Route>
        </Routes>
      </div>
      {!isOwnerPath && <Footer />}
    </div>
  )
}

export default App