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
  const [bookedRanges, setBookedRanges] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const fetchBookedDates = async (carId) => {
    if (!carId) return
    try {
      setLoadingAvailability(true)
      const { data } = await axios.get(`/api/bookings/car-booked-dates/${carId}`)
      if (data.success && data.bookedDates) {
        setBookedRanges(data.bookedDates)
      }
    } catch (error) {
      console.log("fetchBookedDates error:", error.message)
    } finally {
      setLoadingAvailability(false)
    }
  }

  useEffect(() => {
    const foundCar = cars?.find((item) => item._id === id) || dummyCarData.find((item) => item._id === id)
    const currentCar = foundCar || dummyCarData[0]
    setCar(currentCar)
    const initialImg = (currentCar?.images && currentCar.images.length > 0) ? currentCar.images[0] : (currentCar?.image || '')
    setActiveImage(initialImg)
    if (id) {
      fetchBookedDates(id)
    }
  }, [id, cars])

  // Check if selected dates conflict with any existing booking
  const conflict = React.useMemo(() => {
    if (!pickupDate || !returnDate || !bookedRanges.length) return null
    const p = new Date(pickupDate)
    const r = new Date(returnDate)
    if (isNaN(p.getTime()) || isNaN(r.getTime()) || r < p) return null

    for (const b of bookedRanges) {
      const bp = new Date(String(b.pickupDate).split('T')[0])
      const br = new Date(String(b.returnDate).split('T')[0])
      if (p <= br && r >= bp) {
        return {
          pickup: String(b.pickupDate).split('T')[0],
          return: String(b.returnDate).split('T')[0]
        }
      }
    }
    return null
  }, [pickupDate, returnDate, bookedRanges])

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

  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentType, setPaymentType] = useState('online') // 'online' | 'offline'
  const [onlineTab, setOnlineTab] = useState('upi') // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('')
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [selectedBank, setSelectedBank] = useState('HDFC Bank')
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBookNowClick = (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to book a car")
      setShowLogin(true)
      return
    }

    if (!pickupDate || !returnDate) {
      toast.error("Please select both pickup and return dates")
      return
    }

    if (new Date(returnDate) < new Date(pickupDate)) {
      toast.error("Return date cannot be before pickup date")
      return
    }

    if (conflict) {
      toast.error(`Car is already booked from ${conflict.pickup} to ${conflict.return}`)
      return
    }

    setShowCheckout(true)
  }

  const handleConfirmPayment = async () => {
    if (isProcessing) return

    // 1. OFFLINE PAYMENT (PAY ON PICKUP)
    if (paymentType === 'offline') {
      setIsProcessing(true)
      try {
        const { data } = await axios.post('/api/bookings/create', {
          car: car._id,
          pickupDate,
          returnDate,
          paymentMethod: 'Pay on Pickup',
          paymentStatus: 'pending',
          transactionId: `PICKUP_${Date.now()}`
        })

        if (data.success) {
          setConfirmedBooking({
            ...data.booking,
            car,
            price: estimate.total,
            paymentMethod: 'Pay on Pickup',
            paymentStatus: 'pending',
            transactionId: `PICKUP_${Date.now()}`
          })
          toast.success("Booking Confirmed! (Pay at pickup)")
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsProcessing(false)
      }
      return
    }

    // 2. ONLINE PAYMENT GATEWAY (RAZORPAY)
    setIsProcessing(true)
    try {
      // Step A: Create Razorpay Order on server
      const { data: orderData } = await axios.post('/api/bookings/razorpay-order', {
        car: car._id,
        pickupDate,
        returnDate
      })

      if (!orderData.success) {
        toast.error(orderData.message || "Failed to initialize payment gateway")
        setIsProcessing(false)
        return
      }

      // Check if we are in Sandbox / Test Demo Mode without live Razorpay keys
      const isTestPlaceholder = !orderData.key_id || orderData.key_id.includes('DriveSelect') || orderData.order.id?.includes('test')

      if (isTestPlaceholder) {
        // Interactive simulated gateway delay for realistic test experience
        await new Promise((resolve) => setTimeout(resolve, 1200))
        
        const mockTxnId = `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
        const { data: verifyData } = await axios.post('/api/bookings/verify-razorpay', {
          razorpay_order_id: orderData.order.id,
          razorpay_payment_id: mockTxnId,
          razorpay_signature: 'test_demo_signature_valid',
          car: car._id,
          pickupDate,
          returnDate,
          paymentMethod: `Razorpay (${onlineTab.toUpperCase()})`
        })

        if (verifyData.success) {
          setConfirmedBooking({
            ...verifyData.booking,
            car,
            price: estimate.total,
            paymentMethod: `Razorpay (${onlineTab.toUpperCase()})`,
            paymentStatus: 'paid',
            transactionId: mockTxnId
          })
          toast.success("Payment Verified! Your Car is Booked! 🎉")
        } else {
          toast.error(verifyData.message || "Payment verification failed")
        }
        setIsProcessing(false)
        return
      }

      // Live Razorpay Merchant Key Mode
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded || !window.Razorpay) {
        toast.error("Could not load Razorpay SDK")
        setIsProcessing(false)
        return
      }

      // Open official Razorpay Checkout modal
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "DriveSelect Car Rental",
        description: `Booking for ${car.brand} ${car.model}`,
        image: car.image || assets.main_car,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#2563eb"
        },
        handler: async function (response) {
          try {
            setIsProcessing(true)
            const { data: verifyData } = await axios.post('/api/bookings/verify-razorpay', {
              razorpay_order_id: response.razorpay_order_id || orderData.order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              car: car._id,
              pickupDate,
              returnDate,
              paymentMethod: `Razorpay (${onlineTab.toUpperCase()})`
            })

            if (verifyData.success) {
              setConfirmedBooking({
                ...verifyData.booking,
                car,
                price: estimate.total,
                paymentMethod: `Razorpay (${onlineTab.toUpperCase()})`,
                paymentStatus: 'paid',
                transactionId: response.razorpay_payment_id
              })
              toast.success("Payment Verified! Your Car is Booked! 🎉")
            } else {
              toast.error(verifyData.message || "Payment verification failed")
            }
          } catch (err) {
            toast.error(err.message)
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
            toast("Payment window closed", { icon: 'ℹ️' })
          }
        }
      }

      const rzpInstance = new window.Razorpay(options)
      rzpInstance.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`)
        setIsProcessing(false)
      })
      rzpInstance.open()
    } catch (error) {
      toast.error(error.message)
      setIsProcessing(false)
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

  const formatDisplayDate = (d) => {
    if (!d) return ''
    const clean = String(d).split('T')[0]
    const dateObj = new Date(clean + 'T00:00:00')
    if (isNaN(dateObj.getTime())) return clean
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
                  "GPS Navigation",
                  "Climate Control",
                  "Rear Parking Sensors",
                  "Airbags Safety Package"
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

        {/* Right: Booking Date Form with Live Availability & Booked Schedule */}
        <motion.form 
        initial={{ opacity: 0 ,y:30}}
        animate={{ opacity: 1, y:0}}
        transition={{ delay: 0.3, duration: 0.7 }}
        onSubmit={handleBookNowClick} className='shadow-lg h-max sticky top-18 rounded-2xl p-6 space-y-5 text-gray-500 bg-white border border-borderColor'>
          
          <div className='flex items-center justify-between border-b border-borderColor pb-4'>
            <div>
              <span className='text-2xl text-gray-800 font-bold'>{currency}{car.pricePerDay}</span>
              <span className='text-xs text-gray-400 font-normal ml-1.5'>/ day</span>
            </div>
            <span className='px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
              ● Live Booking
            </span>
          </div>

          {/* Booked Schedule Banner */}
          <div className='bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs'>
            <div className='flex items-center justify-between mb-1.5'>
              <span className='font-semibold text-gray-700 flex items-center gap-1.5'>
                <span>📅</span> Car Schedule & Booked Dates:
              </span>
              {loadingAvailability && <span className='text-[10px] text-gray-400 animate-pulse'>Checking...</span>}
            </div>

            {bookedRanges && bookedRanges.length > 0 ? (
              <div className='space-y-1.5 mt-2'>
                <p className='text-[11px] text-amber-700 font-medium'>
                  🔒 Vehicle is already reserved on following dates:
                </p>
                <div className='flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1'>
                  {bookedRanges.map((b, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium text-[11px]'
                    >
                      <span>🔒</span>
                      {formatDisplayDate(b.pickupDate)} → {formatDisplayDate(b.returnDate)}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className='text-[11px] text-emerald-600 font-medium mt-1'>
                ✨ 100% Available! No active bookings on this vehicle.
              </p>
            )}
          </div>

          {/* Pickup Date Input */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='pickup-date' className='text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between'>
              <span>Pickup Date</span>
              {pickupDate && <span className='text-primary font-normal lowercase text-[11px]'>selected</span>}
            </label>
            <input
              type='date'
              id='pickup-date'
              value={pickupDate}
              onChange={(e) => handleDateChange(e.target.value, setPickupDate)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              min={todayStr}
              required
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none text-gray-700 bg-white cursor-pointer transition-colors ${
                conflict ? 'border-rose-400 ring-2 ring-rose-100' : 'border-borderColor focus:border-primary'
              }`}
            />
          </div>

          {/* Return Date Input */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='return-date' className='text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between'>
              <span>Return Date</span>
              {returnDate && <span className='text-primary font-normal lowercase text-[11px]'>selected</span>}
            </label>
            <input
              type='date'
              id='return-date'
              value={returnDate}
              onChange={(e) => handleDateChange(e.target.value, setReturnDate)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              min={pickupDate || todayStr}
              required
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none text-gray-700 bg-white cursor-pointer transition-colors ${
                conflict ? 'border-rose-400 ring-2 ring-rose-100' : 'border-borderColor focus:border-primary'
              }`}
            />
          </div>

          {/* Live Conflict Warning Alert */}
          {conflict && (
            <div className='p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-800 space-y-1 animate-fadeIn'>
              <div className='flex items-center gap-1.5 font-bold text-rose-700'>
                <span>⛔</span>
                <span>Not Available on Selected Dates!</span>
              </div>
              <p className='text-[11px] text-rose-600 leading-relaxed'>
                This vehicle is already booked from <strong>{formatDisplayDate(conflict.pickup)}</strong> to <strong>{formatDisplayDate(conflict.return)}</strong>. Please choose another date range.
              </p>
            </div>
          )}

          {/* Live Available Confirmation */}
          {!conflict && estimate && (
            <div className='p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-fadeIn'>
              <div>
                <p className='text-emerald-800 font-semibold flex items-center gap-1'>
                  <span>✅</span> Dates Available!
                </p>
                <p className='text-[11px] text-emerald-600 mt-0.5'>
                  {estimate.days} {estimate.days === 1 ? 'day rental' : 'days rental'}
                </p>
              </div>
              <div className='text-right'>
                <span className='text-[10px] text-gray-500 block'>Total Amount</span>
                <span className='text-base font-bold text-emerald-800'>{currency}{estimate.total}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={Boolean(conflict)}
            className={`mt-2 w-full py-3.5 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm ${
              conflict
                ? 'bg-rose-100 text-rose-600 border border-rose-300 cursor-not-allowed opacity-80'
                : 'bg-primary hover:bg-primary-dull text-white cursor-pointer hover:shadow-lg'
            }`}
          >
            {conflict ? (
              <>
                <span>⛔</span>
                <span>Dates Already Booked</span>
              </>
            ) : estimate ? (
              `Proceed to Book (${currency}${estimate.total})`
            ) : (
              `Proceed to Book`
            )}
          </button>
        </motion.form>
      </div>

      {/* Realistic Checkout & Payment Modal */}
      {showCheckout && (
        <div
          onClick={() => !isProcessing && !confirmedBooking && setShowCheckout(false)}
          className='fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 my-6 border border-borderColor'
          >
            {confirmedBooking ? (
              /* Success Confirmation View */
              <div className='text-center py-4 space-y-4'>
                <div className='w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-xs'>
                  ✓
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>
                  {confirmedBooking.paymentStatus === 'paid' ? 'Payment Successful!' : 'Booking Confirmed!'}
                </h2>
                <p className='text-xs text-gray-500 max-w-sm mx-auto'>
                  Your reservation for <strong className='text-gray-700'>{car.brand} {car.model}</strong> has been confirmed.
                </p>

                {/* Receipt Card */}
                <div className='bg-gray-50 p-4 rounded-xl text-left text-xs space-y-2.5 border border-borderColor/60 mt-4'>
                  <div className='flex justify-between border-b border-borderColor pb-2'>
                    <span className='text-gray-500'>Rental Vehicle:</span>
                    <span className='font-semibold text-gray-800'>{car.brand} {car.model}</span>
                  </div>
                  <div className='flex justify-between border-b border-borderColor pb-2'>
                    <span className='text-gray-500'>Dates:</span>
                    <span className='font-medium text-gray-800'>{pickupDate} to {returnDate} ({estimate?.days} Days)</span>
                  </div>
                  <div className='flex justify-between border-b border-borderColor pb-2'>
                    <span className='text-gray-500'>Location:</span>
                    <span className='font-medium text-gray-800'>{car.location}</span>
                  </div>
                  <div className='flex justify-between border-b border-borderColor pb-2'>
                    <span className='text-gray-500'>Payment Method:</span>
                    <span className='font-medium text-gray-800'>{confirmedBooking.paymentMethod}</span>
                  </div>
                  {confirmedBooking.transactionId && (
                    <div className='flex justify-between border-b border-borderColor pb-2'>
                      <span className='text-gray-500'>Transaction ID:</span>
                      <span className='font-mono font-medium text-primary'>{confirmedBooking.transactionId}</span>
                    </div>
                  )}
                  <div className='flex justify-between pt-1 text-sm font-bold'>
                    <span className='text-gray-700'>Total Amount:</span>
                    <span className='text-primary'>{currency}{estimate?.total}</span>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowCheckout(false)
                      navigate('/my-bookings')
                    }}
                    className='flex-1 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dull transition-colors cursor-pointer shadow-md'
                  >
                    View in My Bookings
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowCheckout(false)
                      setConfirmedBooking(null)
                    }}
                    className='py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors cursor-pointer'
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Selection & Checkout Flow */
              <div>
                {/* Modal Header */}
                <div className='flex items-center justify-between pb-3 border-b border-borderColor'>
                  <div>
                    <h2 className='text-xl font-bold text-gray-800'>Checkout & Payment</h2>
                    <p className='text-xs text-gray-400 mt-0.5'>Complete your car rental reservation</p>
                  </div>
                  <button
                    disabled={isProcessing}
                    onClick={() => setShowCheckout(false)}
                    className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50'
                  >
                    ✕
                  </button>
                </div>

                {/* Car & Price Summary Banner */}
                <div className='flex items-center gap-4 bg-light/50 p-3.5 rounded-xl border border-borderColor/60 mt-4'>
                  <img src={car.image} alt={car.brand} className='w-20 h-14 object-cover rounded-lg' />
                  <div className='flex-1 text-xs'>
                    <p className='font-bold text-sm text-gray-800'>{car.brand} {car.model}</p>
                    <p className='text-gray-500 mt-0.5'>{pickupDate} to {returnDate} • {estimate?.days} Days</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] uppercase text-gray-400 font-semibold'>Total Payable</p>
                    <p className='text-lg font-bold text-primary'>{currency}{estimate?.total}</p>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className='mt-5'>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Choose Payment Method</label>
                  <div className='grid grid-cols-2 gap-3'>
                    {/* Pay Online */}
                    <div
                      onClick={() => setPaymentType('online')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        paymentType === 'online'
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-borderColor hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-bold text-gray-800'>⚡ Pay Online</span>
                        <input
                          type='radio'
                          name='paymentType'
                          checked={paymentType === 'online'}
                          onChange={() => setPaymentType('online')}
                          className='accent-primary'
                        />
                      </div>
                      <p className='text-[11px] text-gray-500 mt-1.5 leading-tight'>
                        UPI, GPay, Cards & Net Banking (Instant Confirmation)
                      </p>
                    </div>

                    {/* Pay on Pickup */}
                    <div
                      onClick={() => setPaymentType('offline')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        paymentType === 'offline'
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-borderColor hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-bold text-gray-800'>💵 Pay on Pickup</span>
                        <input
                          type='radio'
                          name='paymentType'
                          checked={paymentType === 'offline'}
                          onChange={() => setPaymentType('offline')}
                          className='accent-primary'
                        />
                      </div>
                      <p className='text-[11px] text-gray-500 mt-1.5 leading-tight'>
                        Pay Cash/Card when you collect the car at the location
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-options for Online Payment */}
                {paymentType === 'online' && (
                  <div className='mt-5 p-4 bg-gray-50/80 rounded-xl border border-borderColor space-y-4'>
                    {/* Online payment tabs */}
                    <div className='flex items-center gap-2 border-b border-borderColor pb-3'>
                      <button
                        type='button'
                        onClick={() => setOnlineTab('upi')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          onlineTab === 'upi' ? 'bg-primary text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-borderColor'
                        }`}
                      >
                        UPI / QR Code
                      </button>
                      <button
                        type='button'
                        onClick={() => setOnlineTab('card')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          onlineTab === 'card' ? 'bg-primary text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-borderColor'
                        }`}
                      >
                        Debit / Credit Card
                      </button>
                      <button
                        type='button'
                        onClick={() => setOnlineTab('netbanking')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          onlineTab === 'netbanking' ? 'bg-primary text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-borderColor'
                        }`}
                      >
                        Net Banking
                      </button>
                    </div>

                    {/* UPI Content */}
                    {onlineTab === 'upi' && (
                      <div className='space-y-3 text-xs'>
                        <p className='text-gray-600 font-medium'>Enter your UPI ID (Google Pay, PhonePe, Paytm):</p>
                        <div className='flex gap-2'>
                          <input
                            type='text'
                            placeholder='e.g. mobileNumber@okhdfcbank'
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className='flex-1 px-3 py-2 bg-white border border-borderColor rounded-lg text-xs outline-none focus:border-primary'
                          />
                          <button
                            type='button'
                            onClick={() => setUpiId('user@okaxis')}
                            className='px-2.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[11px] font-medium cursor-pointer'
                          >
                            Use Demo UPI
                          </button>
                        </div>
                        <div className='flex items-center gap-2 pt-1 text-[11px] text-gray-400'>
                          <span>🔒 Fast & 100% Encrypted UPI Gateway</span>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    {onlineTab === 'card' && (
                      <div className='space-y-3 text-xs'>
                        <div>
                          <label className='block text-gray-600 mb-1'>Card Number</label>
                          <input
                            type='text'
                            placeholder='4532 •••• •••• 8921'
                            maxLength={19}
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            className='w-full px-3 py-2 bg-white border border-borderColor rounded-lg text-xs outline-none focus:border-primary'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='block text-gray-600 mb-1'>Expiry (MM/YY)</label>
                            <input
                              type='text'
                              placeholder='12/28'
                              maxLength={5}
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              className='w-full px-3 py-2 bg-white border border-borderColor rounded-lg text-xs outline-none focus:border-primary'
                            />
                          </div>
                          <div>
                            <label className='block text-gray-600 mb-1'>CVV</label>
                            <input
                              type='password'
                              placeholder='•••'
                              maxLength={4}
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              className='w-full px-3 py-2 bg-white border border-borderColor rounded-lg text-xs outline-none focus:border-primary'
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Net Banking Content */}
                    {onlineTab === 'netbanking' && (
                      <div className='space-y-2 text-xs'>
                        <label className='block text-gray-600'>Select Your Bank:</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className='w-full px-3 py-2 bg-white border border-borderColor rounded-lg text-xs outline-none focus:border-primary cursor-pointer'
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Pay on Pickup info notice */}
                {paymentType === 'offline' && (
                  <div className='mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5'>
                    <span className='text-base'>ℹ️</span>
                    <div>
                      <p className='font-semibold'>Pay at the location</p>
                      <p className='text-[11px] text-amber-700 mt-0.5'>
                        Your booking will be reserved. You can pay {currency}{estimate?.total} via Cash, Card, or UPI directly when you inspect and collect the car.
                      </p>
                    </div>
                  </div>
                )}

                {/* Final Confirm / Pay Button */}
                <div className='mt-6 pt-4 border-t border-borderColor flex items-center justify-end gap-3'>
                  <button
                    type='button'
                    disabled={isProcessing}
                    onClick={() => setShowCheckout(false)}
                    className='px-5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50'
                  >
                    Cancel
                  </button>

                  <button
                    type='button'
                    disabled={isProcessing}
                    onClick={handleConfirmPayment}
                    className='px-6 py-3 bg-primary hover:bg-primary-dull text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-60'
                  >
                    {isProcessing ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        Processing Payment...
                      </>
                    ) : paymentType === 'online' ? (
                      `Pay ${currency}${estimate?.total} & Book`
                    ) : (
                      `Confirm Reservation`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CarDetails