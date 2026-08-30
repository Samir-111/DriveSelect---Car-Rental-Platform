import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { assets, ownerMenuLinks } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const SideBar = () => {
  const { user, axios, fetchUser } = useAppContext()
  const location = useLocation()
  const [image, setImage] = useState(null)

  const updateImage = async () => {
    if (!image) return
    try { 
      const formData = new FormData()
      formData.append('image', image)

      const { data } = await axios.post('/api/owner/update-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if(data.success){
        fetchUser()
        toast.success(data.message || 'Image updated')
        setImage(null)
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='w-16 md:w-64 min-h-screen bg-white border-r border-borderColor flex flex-col items-center pt-8 px-4 relative'>
      <div className='relative group flex flex-col items-center mb-6'>
        <label htmlFor="image" className='cursor-pointer relative rounded-full overflow-hidden block w-20 h-20 border border-borderColor'>
          <img
            src={image ? URL.createObjectURL(image) : (user?.image || assets.user_profile)}
            alt="User Profile"
            className='w-full h-full object-cover'
          />
          <input
            type="file"
            id="image"
            className='hidden'
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <img src={assets.edit_icon} alt="Edit" className='w-5 h-5 brightness-200' />
          </div>
        </label>

        {image && (
          <button
            onClick={updateImage}
            className='absolute top-0 right-0 flex items-center p-2 gap-1 bg-primary/10 text-primary cursor-pointer rounded text-xs font-medium'
          >
            Save <img src={assets.check_icon} width={13} alt="" />
          </button>
        )}

        <p className='mt-2 text-base max-md:hidden font-semibold text-gray-800'>{user?.name}</p>
      </div>

      <div className='w-full flex flex-col gap-1'>
        {ownerMenuLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${
              link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'
            }`}
          >
            <img
              src={link.path === location.pathname ? link.coloredIcon : link.icon}
              alt={link.name}
              className='w-5 h-5'
            />
            <span className='max-md:hidden text-sm'>{link.name}</span>
            <div
              className={`${
                link.path === location.pathname ? 'bg-primary' : ''
              } w-1.5 h-8 rounded-l right-0 absolute`}
            ></div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default SideBar


