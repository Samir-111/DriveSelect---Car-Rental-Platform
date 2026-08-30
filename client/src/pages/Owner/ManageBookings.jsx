import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { dummyMyBookingsData } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const ManageBookings = () => {
  const { currency, axios, token } = useAppContext()

  const [bookings, setBookings] = useState(dummyMyBookingsData)

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/owner')
      if (data.success && data.bookings) {
        setBookings(data.bookings)
      } else if (data.message) {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/bookings/owner-status', { bookingId, status })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOwnerBookings()
    }
  }, [token])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return String(dateStr).split('T')[0]
  }

  return (
    <div>
      <Title title="Manage Bookings" subTitle="View and confirm incoming rental requests" align="left" />

      <div className='bg-white rounded-2xl border border-borderColor shadow-sm mt-8 overflow-x-auto'>
        <table className='w-full text-left text-sm text-gray-600'>
          <thead className='bg-gray-50 border-b border-borderColor text-xs uppercase text-gray-500 font-semibold'>
            <tr>
              <th className='p-4'>Car</th>
              <th className='p-4'>Date Range</th>
              <th className='p-4'>Total Price</th>
              <th className='p-4 max-md:hidden'>Payment</th>
              <th className='p-4'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {bookings.map((booking, index) => (
              <tr key={booking._id || index} className='hover:bg-gray-50/50 transition-colors'>
                <td className='p-4 flex items-center gap-3'>
                  {booking.car && <img src={booking.car.image} alt={booking.car.brand} className='w-14 h-10 object-cover rounded-lg' />}
                  <div>
                    <p className='font-semibold text-gray-800'>{booking.car?.brand} {booking.car?.model}</p>
                    <p className='text-xs text-gray-400'>{booking.car?.location}</p>
                  </div>
                </td>

                <td className='p-4 text-xs text-gray-600'>
                  {formatDate(booking.pickupDate)} to {formatDate(booking.returnDate)}
                </td>

                <td className='p-4 font-semibold text-gray-900'>{currency}{booking.price}</td>

                <td className='p-4 max-md:hidden'>
                  <span className='bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600'>offline</span>
                </td>

                <td className='p-4'>
                  {booking.status === 'pending' ? (
                    <select
                      value={booking.status}
                      onChange={(e) => changeBookingStatus(booking._id, e.target.value)}
                      className='px-2 py-1.5 text-xs text-gray-600 border border-borderColor rounded-md outline-none bg-white cursor-pointer'
                    >
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBookings

