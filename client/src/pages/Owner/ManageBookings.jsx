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
              <th className='p-4'>Total / Earning</th>
              <th className='p-4 max-md:hidden'>Payment & Payout</th>
              <th className='p-4'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {bookings.map((booking, index) => {
              const platformFee = Math.round((booking.price || 0) * 0.10)
              const ownerShare = (booking.price || 0) - platformFee

              return (
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

                  <td className='p-4'>
                    <div className='flex flex-col'>
                      <span className='font-bold text-gray-900'>{currency}{booking.price}</span>
                      <span className='text-[11px] text-emerald-700 font-medium'>
                        Net: {currency}{ownerShare} <span className='text-[10px] text-gray-400'>(-10% fee)</span>
                      </span>
                    </div>
                  </td>

                  <td className='p-4 max-md:hidden'>
                    <div className='flex flex-col gap-1 items-start'>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {booking.paymentStatus === 'paid' ? '● Paid (To Bank)' : '○ Pay on Pickup'}
                      </span>
                      <span className='text-[11px] text-gray-500 uppercase font-mono'>
                        {booking.paymentMethod || 'offline'}
                      </span>
                    </div>
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
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBookings

