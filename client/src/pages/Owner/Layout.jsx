import React, { useEffect } from 'react'
import NavbarOwner from '../../components/Owner/NavbarOwner'
import SideBar from '../../components/Owner/SideBar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isOwner, token } = useAppContext()
  const navigate = useNavigate()
  
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || token
    if (!savedToken && !isOwner) {
      navigate('/')
    }
  }, [isOwner, token, navigate])

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <NavbarOwner />
      <div className='flex flex-1'>
        <SideBar />
        <div className='flex-1 p-6 md:p-10 overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
