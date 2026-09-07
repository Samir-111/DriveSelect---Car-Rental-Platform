import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets, dummyMyBookingsData } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import{motion} from 'motion/react'

const MyBooking = () => {
  const { currency, axios, token } = useAppContext()
  const [bookings, setBookings] = useState(dummyMyBookingsData)


  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.bookings){
        setBookings(data.bookings)
      }else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUserBookings()
    }
  }, [token])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return String(dateStr).split('T')[0]
  }

  return (
    <motion.div 
    initial={{ opacity: 0 ,y:30}}
    animate={{ opacity: 1, y:0}}
    transition={{duration: 0.6 }}
    className='px-6 md:px-10 lg:px-24 xl:px-32 py-12 min-h-[80vh] bg-light/30'>
      <Title
        title="My Bookings"
        subTitle="Manage and track your active and past vehicle reservations"
        align="left"
      />

      <div className='mt-10 flex flex-col gap-6 max-w-5xl'>
        {bookings.map((booking, index) => (
          <motion.div
          initial={{ opacity: 0 ,y:20}}
          animate={{ opacity: 1, y:0}}
          transition={{ delay: 0.1*index, duration: 0.4}}

            key={booking._id || index}
            className='bg-white p-6 rounded-2xl shadow-sm border border-borderColor flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center gap-5'>
              <img
                src={booking.car?.image || assets.main_car}
                alt={booking.car?.brand || 'Car'}
                className='w-28 h-20 object-cover rounded-xl border border-gray-100'
              />
              <div>
                <h3 className='font-semibold text-lg text-gray-800 mb-1'>
                  {booking.car?.brand} {booking.car?.model}
                </h3>

                <div className='flex items-center gap-2 mb-2'>
                  <p className='px-3 py-1 text-xs bg-light text-gray-600 rounded font-medium'>
                    Booking #{index + 1}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-400/15 text-green-600'
                        : booking.status === 'pending'
                        ? 'bg-amber-400/15 text-amber-600'
                        : 'bg-red-400/15 text-red-600'
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>

                {/* Rental Period */}
                <div className='flex items-start gap-2 mt-3 text-xs text-gray-600'>
                  <img
                    src={assets.calendar_icon_colored}
                    alt=""
                    className='w-4 h-4 mt-0.5'
                  />
                  <div>
                    <p className='text-gray-500 font-medium'>Rental Period</p>
                    <p className='text-gray-700 font-semibold mt-0.5'>
                      {formatDate(booking.pickupDate)} To {formatDate(booking.returnDate)}
                    </p>
                  </div>
                </div>

                {/* Pick-up Location */}
                <div className='flex items-start gap-2 mt-3 text-xs text-gray-600'>
                  <img
                    src={assets.location_icon_colored}
                    alt=""
                    className='w-4 h-4 mt-0.5'
                  />
                  <div>
                    <p className='text-gray-500 font-medium'>Pick-up Location</p>
                    <p className='text-gray-700 font-semibold mt-0.5'>
                      {booking.car?.location}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className='flex flex-wrap items-center gap-2 mt-3 text-xs'>
                  <span className='text-gray-500 font-medium'>Payment:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-medium ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {booking.paymentStatus === 'paid' ? '● Paid' : '○ Pay at Pickup'}
                  </span>
                  {booking.paymentMethod && (
                    <span className='px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase font-mono text-[10px]'>
                      {booking.paymentMethod}
                    </span>
                  )}
                  {booking.transactionId && (
                    <span className='text-gray-400 font-mono text-[11px]'>
                      TXN: {booking.transactionId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className='md:col-span-1 flex flex-col justify-between items-start sm:items-end gap-3'>
              <div className='text-sm text-gray-500 sm:text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                {booking.createdAt && <p className='text-xs text-gray-400 mt-0.5'>Booked on {formatDate(booking.createdAt)}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default MyBooking