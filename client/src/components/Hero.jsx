import React, { useState } from 'react'
import { assets } from '../assets/assets.js'
import { useAppContext } from '../context/AppContext.jsx'
import { motion } from 'motion/react'
import { toast } from 'react-hot-toast'

const Hero = () => {
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate, locations, addLocation } = useAppContext()
  const [pickupLocation, setPickupLocation] = useState('')
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [newLocationInput, setNewLocationInput] = useState('')

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
          <div className='flex flex-col items-start gap-1 w-full md:w-auto relative'>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Location</label>
            <select
              value={isAddingLocation ? 'ADD_NEW' : pickupLocation}
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW') {
                  setIsAddingLocation(true)
                } else {
                  setIsAddingLocation(false)
                  setPickupLocation(e.target.value)
                }
              }}
              required={!isAddingLocation}
              className='px-3 py-1.5 border border-borderColor rounded-lg text-gray-700 outline-none w-full text-sm bg-white cursor-pointer'
            >
              <option value=''>Pickup Location</option>
              {locations.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
              <option value="ADD_NEW" className="text-primary font-medium">+ Add New Location</option>
            </select>

            {isAddingLocation && (
              <div className='absolute top-full left-0 mt-2 z-50 bg-white p-3 rounded-xl shadow-2xl border border-gray-200 flex flex-col gap-2 min-w-[240px] text-left'>
                <p className='text-xs font-semibold text-gray-700'>Add Custom Location</p>
                <input
                  type='text'
                  placeholder='e.g. San Francisco, Pune'
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (newLocationInput.trim()) {
                        const added = addLocation(newLocationInput)
                        setPickupLocation(added)
                        setIsAddingLocation(false)
                        setNewLocationInput('')
                        toast.success(`"${added}" added to locations!`)
                      }
                    }
                  }}
                  className='px-3 py-1.5 border border-borderColor rounded-lg text-xs outline-none focus:border-primary'
                  autoFocus
                />
                <div className='flex items-center justify-end gap-2 mt-1'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsAddingLocation(false)
                      setNewLocationInput('')
                    }}
                    className='px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      if (!newLocationInput.trim()) {
                        toast.error("Please enter a location name")
                        return
                      }
                      const added = addLocation(newLocationInput)
                      setPickupLocation(added)
                      setIsAddingLocation(false)
                      setNewLocationInput('')
                      toast.success(`"${added}" added to locations!`)
                    }}
                    className='px-3 py-1 text-xs text-white bg-primary rounded-md hover:bg-primary-dull cursor-pointer font-medium'
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
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
