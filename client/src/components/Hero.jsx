import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets.js'
import { useAppContext } from '../context/AppContext.jsx'
import { motion } from 'motion/react'

const Hero = () => {
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext()
  const [pickupLocation, setPickupLocation] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    let query = `/cars?pickupLocation=${encodeURIComponent(pickupLocation)}`
    if (pickupDate) query += `&pickupDate=${pickupDate}`
    if (returnDate) query += `&returnDate=${returnDate}`
    navigate(query)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='min-h-[85vh] flex flex-col items-center justify-center gap-12 bg-light text-center px-4 py-12'
    >
      <motion.h1 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='text-4xl md:text-5xl lg:text-6xl font-semibold max-w-2xl leading-tight'
      >
        Luxury cars on rent
      </motion.h1>

      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch}
        className='flex flex-col md:flex-row items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-full w-full max-w-4xl bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] gap-6 md:gap-4'
      >
        {/* Input fields wrapper */}
        <div className='flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full md:w-auto md:ml-4'>
          {/* Pickup location select field */}
          <div className='flex flex-col items-start gap-1 w-full md:w-auto'>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Location</label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
              className='px-3 py-1.5 border border-borderColor rounded-lg text-gray-700 outline-none w-full text-sm'
            >
              <option value=''>Pickup Location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup date input field */}
          <div className='flex flex-col items-start gap-1 w-full md:w-auto'>
            <label htmlFor='pickup-date' className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Pick-up Date</label>
            <input
              type='date'
              id='pickup-date'
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className='px-3 py-1.5 border border-borderColor rounded-lg text-sm text-gray-700 outline-none w-full'
              required
            />
          </div>

          {/* Return date input field */}
          <div className='flex flex-col items-start gap-1 w-full md:w-auto'>
            <label htmlFor='return-date' className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Return Date</label>
            <input
              type='date'
              id='return-date'
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className='px-3 py-1.5 border border-borderColor rounded-lg text-sm text-gray-700 outline-none w-full'
              required
            />
          </div>
        </div>

        {/* Search button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type='submit'
          className='flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl md:rounded-full hover:bg-primary-dull transition-colors duration-300 w-full md:w-auto cursor-pointer shadow-md'
        >
          <img src={assets.search_icon} alt='search' className='brightness-200 h-4' />
          Search
        </motion.button>
      </motion.form>

      <motion.img 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        src={assets.main_car} alt='car' className='max-h-72 object-contain mt-4'
      />
    </motion.div>
  )
}

export default Hero
