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
  const [activeImage, setActiveImage] = useState('')
  const [pickupDate, setPickupDate] = useState(ctxPickupDate || '')
  const [returnDate, setReturnDate] = useState(ctxReturnDate || '')

  useEffect(() => {
    const foundCar = cars?.find((item) => item._id === id) || dummyCarData.find((item) => item._id === id)
    const currentCar = foundCar || dummyCarData[0]
    setCar(currentCar)
    const initialImg = (currentCar?.images && currentCar.images.length > 0) ? currentCar.images[0] : (currentCar?.image || '')
    setActiveImage(initialImg)
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

  const carImages = (car?.images && car.images.length > 0) ? car.images : (car?.image ? [car.image] : [])

  const handleDateChange = (val, setter) => {
    if (!val) {
      setter('')
      return
    }
    const parts = val.split('-')
    if (parts.length === 3) {
      let [year, month, day] = parts
      if (year.length === 4 && (year.startsWith('00') || parseInt(year, 10) < 2000)) {
        const shortYear = parseInt(year, 10)
        if (shortYear >= 0 && shortYear < 100) {
          year = `20${shortYear.toString().padStart(2, '0')}`
          val = `${year}-${month}-${day}`
        }
      }
    }
    setter(val)
  }

  const todayStr = new Date().toISOString().split('T')[0]

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
        {/* Left: Car Image Gallery & Details */}
        <motion.div 
        initial={{ opacity: 0, y:30 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 0.5 }}
        className='lg:col-span-2'>
          {/* Main Featured Photo */}
          <div className='relative w-full h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-gray-100 shadow-md'>
            <motion.img
              key={activeImage}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={activeImage || car.image}
              alt={`${car.brand} ${car.model}`}
              className='w-full h-full object-cover'
            />
            {carImages.length > 1 && (
              <div className='absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full'>
                {carImages.indexOf(activeImage) + 1} / {carImages.length} Photos
              </div>
            )}
          </div>

          {/* Interactive Thumbnails Strip (Exterior, Interior, Angles) */}
          {carImages.length > 1 && (
            <div className='flex items-center gap-3 mt-3.5 overflow-x-auto pb-2'>
              {carImages.map((img, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-16 sm:w-24 sm:h-18 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Angle ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-black/5 hover:bg-transparent transition-colors' />
                </button>
              ))}
            </div>
          )}

          <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='space-y-6 mt-6'>


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
              onChange={(e) => handleDateChange(e.target.value, setPickupDate)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              min={todayStr}
              required
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none text-gray-700 focus:border-primary bg-white cursor-pointer'
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
              onChange={(e) => handleDateChange(e.target.value, setReturnDate)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              min={pickupDate || todayStr}
              required
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none text-gray-700 focus:border-primary bg-white cursor-pointer'
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