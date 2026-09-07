import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { dummyDashboardData, assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
  const { axios, currency, isOwner } = useAppContext()

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/owner/dashboard')
      if (data.success) {
        setData(data.dashboardData || data.dadhbordData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData()
    } else {
      setData(dummyDashboardData)
    }
  }, [isOwner])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return String(dateStr).split('T')[0]
  }

  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.car_icon },
    { title: "Total Bookings", value: data.totalBookings, icon: assets.listIcon },
    { title: "Pending Bookings", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed Bookings", value: data.completedBookings, icon: assets.check_icon },
  ]

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title
        title="Admin Dashboard"
        subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities"
        align="left"
      />

      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor bg-white'
          >
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* Recent Bookings Table */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full bg-white'>
          <h1 className='text-lg font-semibold'>Recent Bookings</h1>
          <p className='text-gray-600 text-sm'>Latest customer bookings</p>
          {data.recentBookings.map((booking, index) => (
            <div key={booking._id || index} className='flex items-center justify-between mt-4 pb-3 border-b border-gray-100 last:border-0 last:pb-0'>
              <div className='flex items-center gap-3'>
                <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                  <img src={assets.listIconColored} alt="" className='h-5 w-5' />
                </div>
                <div>
                  <p className='font-medium text-gray-800'>{booking.car?.brand} {booking.car?.model}</p>
                  <p className='text-sm text-gray-500'>{formatDate(booking.createdAt)}</p>
                </div>
              </div>

              <div className='flex items-center gap-2 font-medium'>
                <p className='text-sm text-gray-500'>{currency}{booking.price}</p>
                <p className='px-3 py-0.5 border border-borderColor rounded-full text-xs capitalize text-gray-600'>{booking.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Revenue & Commission Breakdown */}
        <div className='p-4 md:p-6 border border-borderColor rounded-2xl max-w-lg w-full bg-white space-y-4 shadow-xs'>
          <div>
            <h1 className='text-lg font-semibold text-gray-800'>Earnings & Commission Breakdown</h1>
            <p className='text-gray-500 text-xs mt-0.5'>Model 2: 90% Owner Net Share • 10% Platform Fee</p>
          </div>

          <div className='space-y-2.5 text-xs'>
            <div className='p-3.5 bg-gray-50 rounded-xl flex items-center justify-between'>
              <span className='font-medium text-gray-600'>Gross Booking Value:</span>
              <span className='text-base font-bold text-gray-800'>{currency}{data.grossRevenue || data.monthlyRevenue || 0}</span>
            </div>

            <div className='p-3.5 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-100'>
              <div>
                <span className='font-bold text-emerald-800 block text-xs'>Your Net Share (90%):</span>
                <span className='text-[10px] text-emerald-600'>Credited to your bank / kept from cash</span>
              </div>
              <span className='text-lg font-extrabold text-emerald-700'>{currency}{data.ownerNetRevenue || Math.round((data.monthlyRevenue || 0) * 0.90)}</span>
            </div>

            <div className='p-3.5 bg-amber-50 rounded-xl flex items-center justify-between border border-amber-100'>
              <div>
                <span className='font-bold text-amber-800 block text-xs'>Platform Commission Due (10% on Cash):</span>
                <span className='text-[10px] text-amber-600'>Auto-adjusted on online payouts</span>
              </div>
              <span className='text-sm font-bold text-amber-800'>{currency}{data.platformCommissionDue || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

