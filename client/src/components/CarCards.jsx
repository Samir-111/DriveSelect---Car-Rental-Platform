import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const CarCards = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/car-details/${car._id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div
      onClick={handleCardClick}
      className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white border border-borderColor flex flex-col justify-between'
    >
      <div className='relative h-48 overflow-hidden'>
        <img
          src={car.image}
          alt={car.name || `${car.brand} ${car.model}`}
          className='w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105'
        />
        {(car.isAvailable || car.isAvaliable) && (
          <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full font-medium'>
            Available now
          </p>
        )}

        <div className='absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg'>
          <span className='font-semibold'>
            {currency}
            {car.pricePerDay}
          </span>
          <span className='text-xs text-white/80'> / day</span>
        </div>
      </div>

      <div className='p-4 sm:p-6'>
        <div className='flex justify-between items-start mb-2'>
          <div>
            <h3 className='text-lg font-medium text-gray-800'>
              {car.brand} {car.model}
            </h3>
            <p className='text-gray-500 text-sm'>
              {car.category} • {car.year}
            </p>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600 text-sm'>
          <div className='flex items-center'>
            <img src={assets.users_icon} alt='user' className='h-4 mr-2' />
            <span>{car.seating_capacity} Seats</span>
          </div>

          <div className='flex items-center'>
            <img src={assets.fuel_icon} alt='fuel' className='h-4 mr-2' />
            <span>{car.fuel_type || car.fuelType}</span>
          </div>

          <div className='flex items-center'>
            <img src={assets.car_icon} alt='car' className='h-4 mr-2' />
            <span>{car.transmission}</span>
          </div>

          <div className='flex items-center'>
            <img src={assets.location_icon} alt='location' className='h-4 mr-2' />
            <span>{car.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarCards
