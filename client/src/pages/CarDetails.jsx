import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dummyCarData, assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import{motion} from 'motion/react'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currency, cars, axios, user, setShowLogin, pickupDate: ctxPickupDate, returnDate: ctxReturnDate } = useAppContext()

  const [car, setCar] = useState(null)
  const [pickupDate, setPickupDate] = useState(ctxPickupDate || '')
  const [returnDate, setReturnDate] = useState(ctxReturnDate || '')

  useEffect(() => {
    const foundCar = cars?.find((item) => item._id === id) || dummyCarData.find((item) => item._id === id)
    setCar(foundCar || dummyCarData[0])
  }, [id, cars])

  const calculateTotal = () => {
    if (!pickupDate || !returnDate || !car) return null
    const picked = new Date(pickupDate)
    const returned = new Date(returnDate)
    if (isNaN(picked.getTime()) || isNaN(returned.getTime()) || returned < picked) return null
    const diffTime = returned.getTime() - picked.getTime()
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    return { days: diffDays, total: diffDays * (car.pricePerDay || 0) }
  }

  const estimate = calculateTotal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to book a car")
      setShowLogin(true)
      return
    }

    if (new Date(returnDate) < new Date(pickupDate)) {
      toast.error("Return date cannot be before pickup date")
      return
    }

    try {
      const { data } = await axios.post('/api/bookings/create', {
        car: car._id,
        pickupDate,
        returnDate
      })
      if (data.success) {
        toast.success(data.message || "Booking created successfully!")
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!car) {
    return <Loader />
  }

  return (
    <div className='px-6 md:px-10 lg:px-24 xl:px-32 mt-10 min-h-[80vh] pb-16'>
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors'
      >
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65 h-3.5' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Car Image & Details */}
        <motion.div 
        initial={{ opacity: 0, y:30 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 0.5 }}
        className='lg:col-span-2'>
          <motion.img
          initial={{ scale:0.98, opacity: 0 }}
           animate={{ scale:1, opacity: 1}}
           transition={{ duration: 0.5 }}
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md'
          />
          <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='space-y-6'>


            <div>
              <h1 className='text-2xl md:text-3xl font-semibold text-gray-800'>
                {car.brand} {car.model}
              </h1>
              <p className='text-gray-500 text-sm mt-1'>
                {car.category} • {car.year} • {car.location}
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className='text-xl font-medium mb-3 text-gray-800'>Description</h2>
              <p className='text-gray-500 leading-relaxed'>{car.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className='text-xl font-medium mb-3 text-gray-800'>Features</h2>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {[
                  "360 Camera",
                  "Bluetooth",
                  "GPS",
                  "Heated Seats",
                  "Rear View Mirror"
                ].map((item) => (
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.form 
        initial={{ opacity: 0 ,y:30}}
        animate={{ opacity: 1, y:0}}
        transition={{ delay: 0.3, duration: 0.7 }}
        onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500 bg-white border border-borderColor'>
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
            {currency}{car.pricePerDay}
            <span className='text-base text-gray-400 font-normal'>per day</span>
          </p>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='pickup-date' className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
              Pickup Date
            </label>
            <input
              type='date'
              id='pickup-date'
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none text-gray-700 focus:border-primary'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='return-date' className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
              Return Date
            </label>
            <input
              type='date'
              id='return-date'
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || new Date().toISOString().split('T')[0]}
              required
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none text-gray-700 focus:border-primary'
            />
          </div>

          {estimate && (
            <div className='p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm'>
              <span className='text-gray-600 font-medium'>Total ({estimate.days} {estimate.days === 1 ? 'day' : 'days'}):</span>
              <span className='text-lg font-bold text-primary'>{currency}{estimate.total}</span>
            </div>
          )}

          <button
            type='submit'
            className='mt-4 w-full py-3.5 bg-primary hover:bg-primary-dull text-white font-medium rounded-xl transition-all shadow-md cursor-pointer'
          >
            Book Now
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default CarDetails