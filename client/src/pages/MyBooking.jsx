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

  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('Change of travel plans')
  const [otherReasonText, setOtherReasonText] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancelBooking = async () => {
    if (!selectedBookingToCancel || isCancelling) return

    setIsCancelling(true)
    const finalReason = cancelReason === 'Other' ? (otherReasonText || 'Other reason') : cancelReason

    try {
      const { data } = await axios.post('/api/bookings/cancel', {
        bookingId: selectedBookingToCancel._id,
        reason: finalReason
      })

      if (data.success) {
        toast.success(data.message)
        setSelectedBookingToCancel(null)
        setOtherReasonText('')
        fetchUserBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <motion.div 
    initial={{ opacity: 0 ,y:30}}
    animate={{ opacity: 1, y:0}}
    transition={{duration: 0.6 }}
    className='px-6 md:px-10 lg:px-24 xl:px-32 py-12 min-h-[80vh] bg-light/30'>
      <Title
        title="My Bookings"
        subTitle="Manage and track your active, completed and cancelled vehicle reservations"
        align="left"
      />

      <div className='mt-10 flex flex-col gap-6 max-w-5xl'>
        {bookings.map((booking, index) => (
          <motion.div
          initial={{ opacity: 0 ,y:20}}
          animate={{ opacity: 1, y:0}}
          transition={{ delay: 0.1*index, duration: 0.4}}

            key={booking._id || index}
            className='bg-white p-6 rounded-2xl shadow-sm border border-borderColor flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow relative'
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

                <div className='flex flex-wrap items-center gap-2 mb-2'>
                  <p className='px-3 py-1 text-xs bg-light text-gray-600 rounded font-medium'>
                    Booking #{index + 1}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full capitalize font-semibold ${
                      booking.status === 'confirmed'
                        ? 'bg-green-400/15 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-amber-400/15 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {booking.status === 'cancelled' ? '● Cancelled' : booking.status}
                  </p>

                  {/* Refund status badge if cancelled */}
                  {booking.status === 'cancelled' && (
                    <span className='px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'>
                      {booking.paymentStatus === 'paid' ? '💸 Full Refund Initiated' : '○ No Fee Charged'}
                    </span>
                  )}
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

                {/* Payment & Refund Info */}
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

                {/* Cancellation Reason if cancelled */}
                {booking.status === 'cancelled' && booking.cancellationReason && (
                  <div className='mt-2.5 p-2 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-700'>
                    <span className='font-semibold'>Cancellation Reason:</span> {booking.cancellationReason}
                  </div>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            <div className='md:col-span-1 flex flex-col justify-between items-start sm:items-end gap-3 self-stretch sm:self-center'>
              <div className='text-sm text-gray-500 sm:text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                {booking.createdAt && <p className='text-xs text-gray-400 mt-0.5'>Booked on {formatDate(booking.createdAt)}</p>}
              </div>

              {/* Cancel Booking Action Button */}
              {booking.status !== 'cancelled' && (
                <button
                  type='button'
                  onClick={() => setSelectedBookingToCancel(booking)}
                  className='px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors mt-2 sm:mt-0'
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cancellation Confirmation Modal */}
      {selectedBookingToCancel && (
        <div
          onClick={() => !isCancelling && setSelectedBookingToCancel(null)}
          className='fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-borderColor space-y-5 animate-fadeIn'
          >
            <div className='flex items-start justify-between border-b border-borderColor pb-3'>
              <div>
                <h2 className='text-lg font-bold text-gray-800 flex items-center gap-1.5'>
                  <span>⚠️</span> Cancel Vehicle Booking?
                </h2>
                <p className='text-xs text-gray-500 mt-0.5'>
                  {selectedBookingToCancel.car?.brand} {selectedBookingToCancel.car?.model}
                </p>
              </div>
              <button
                type='button'
                disabled={isCancelling}
                onClick={() => setSelectedBookingToCancel(null)}
                className='text-gray-400 hover:text-gray-700 text-lg cursor-pointer'
              >
                ✕
              </button>
            </div>

            {/* Refund Policy Card */}
            <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
              selectedBookingToCancel.paymentStatus === 'paid'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-gray-50 border-borderColor text-gray-700'
            }`}>
              <p className='font-bold flex items-center gap-1'>
                <span>{selectedBookingToCancel.paymentStatus === 'paid' ? '💸' : 'ℹ️'}</span>
                {selectedBookingToCancel.paymentStatus === 'paid'
                  ? '100% Full Refund Guaranteed'
                  : 'Zero Cancellation Fee'}
              </p>
              <p className='text-[11px] text-gray-600 leading-relaxed'>
                {selectedBookingToCancel.paymentStatus === 'paid'
                  ? `Full refund of ${currency}${selectedBookingToCancel.price} will be initiated directly to your original payment method within 24-48 hours.`
                  : `Your Pay on Pickup reservation will be voided immediately with no charges.`}
              </p>
            </div>

            {/* Reason Selector */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Select Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full px-3.5 py-2.5 bg-gray-50 border border-borderColor rounded-xl text-xs outline-none focus:border-primary focus:bg-white cursor-pointer'
              >
                <option value="Change of travel plans">Change of travel plans</option>
                <option value="Booked incorrect dates">Booked incorrect dates</option>
                <option value="Found an alternate vehicle">Found an alternate vehicle</option>
                <option value="Emergency / Personal reason">Emergency / Personal reason</option>
                <option value="Other">Other</option>
              </select>

              {cancelReason === 'Other' && (
                <textarea
                  placeholder='Please tell us the reason...'
                  rows={2}
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  className='mt-2 w-full px-3 py-2 bg-gray-50 border border-borderColor rounded-xl text-xs outline-none focus:border-primary focus:bg-white'
                />
              )}
            </div>

            {/* Modal Buttons */}
            <div className='pt-3 flex items-center justify-end gap-3'>
              <button
                type='button'
                disabled={isCancelling}
                onClick={() => setSelectedBookingToCancel(null)}
                className='px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer disabled:opacity-50'
              >
                Keep Booking
              </button>

              <button
                type='button'
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className='px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-60'
              >
                {isCancelling ? (
                  <>
                    <div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default MyBooking