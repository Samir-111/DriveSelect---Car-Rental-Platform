import React from 'react'
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const NavbarOwner = () => {
  const { user } = useAppContext()


  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to='/'>
        <img src={assets.logo} alt="Logo" className="h-8 brightness-200" />
      </Link>
      <p> Welcome, {user?.name || "Owner"}! </p>
    </div>
  )
}

export default NavbarOwner

