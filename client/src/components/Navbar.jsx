import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assets, menuLinks } from '../assets/assets.js';
import { useAppContext } from '../context/AppContext.jsx';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react'

const Navbar = () => {
  const { setShowLogin, user, logout, isOwner, axios, setIsOwner } = useAppContext()

  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleListCar = async () => {
    if (!user) {
      toast.error("Please login to list your car")
      setShowLogin(true)
      return
    }
    if (isOwner) {
      navigate('/owner')
    } else {
      try {
        const { data } = await axios.post('/api/owner/change-role')
        if (data.success) {
          setIsOwner(true)
          toast.success(data.message)
          navigate('/owner')
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (search.trim()) {
        navigate(`/cars?search=${encodeURIComponent(search.trim())}`)
        setSearch('')
        setOpen(false)
      }
    }
  }

  return (
    <div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${
          location.pathname === '/' && 'bg-light'
        }`}
      >
        <Link to="/" onClick={() => setOpen(false)}>
          <motion.img whileHover={{ scale: 1.05 }} src={assets.logo} alt="logo" className="h-8" />
        </Link>

        <div
          className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${
            location.pathname === '/' ? 'bg-light' : 'bg-white'
          } ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}
        >
          {menuLinks.map((link, index) => (
            <Link key={index} to={link.path} onClick={() => setOpen(false)}>
              {link.name}
            </Link>
          ))}

          <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              placeholder="Search cars..."
            />
            <img
              src={assets.search_icon}
              alt="search"
              className="cursor-pointer"
              onClick={handleSearchSubmit}
            />
          </div>

          <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
            <button
              onClick={() => {
                setOpen(false)
                handleListCar()
              }}
              className="cursor-pointer font-medium hover:text-primary transition-colors"
            >
              {isOwner ? 'Dashboard' : 'List Car'}
            </button>

            <button
              onClick={() => {
                setOpen(false)
                if (user) {
                  logout()
                } else {
                  setShowLogin(true)
                }
              }}
              className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
            >
              {user ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>

        <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={() => setOpen(!open)}>
          <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
        </button>
      </motion.div>
    </div>
  );
};

export default Navbar;
