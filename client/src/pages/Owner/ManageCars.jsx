import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets, dummyCarData } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const ManageCars = () => {
  const { axios, currency, token } = useAppContext()
  const [cars, setCars] = useState(dummyCarData)

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success && data.cars) {
        setCars(data.cars)
      } else if (data.message) {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCarHandler = async (carId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this car?')
      if (!confirmDelete) return null

      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOwnerCars()
    }
  }, [token])

  return (
    <div>
      <Title title="Manage Cars" subTitle="View and edit your listed fleet" align="left" />

      <div className='bg-white rounded-2xl border border-borderColor shadow-sm mt-8 overflow-x-auto'>
        <table className='w-full text-left text-sm text-gray-600'>
          <thead className='bg-gray-50 border-b border-borderColor text-xs uppercase text-gray-500 font-semibold'>
            <tr>
              <th className='p-4'>Car</th>
              <th className='p-4'>Category</th>
              <th className='p-4'>Location</th>
              <th className='p-4'>Price/Day</th>
              <th className='p-4'>Status</th>
              <th className='p-4 text-center'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {cars.map((car, index) => (
              <tr key={car._id || index} className='hover:bg-gray-50/50 transition-colors'>
                <td className='p-4 flex items-center gap-3'>
                  <img src={car.image} alt={car.brand} className='w-14 h-10 object-cover rounded-lg' />
                  <div>
                    <p className='font-semibold text-gray-800'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-400'>{car.year} • {car.seating_capacity} Seats • {car.transmission}</p>
                  </div>
                </td>
                <td className='p-4'>{car.category}</td>
                <td className='p-4'>{car.location}</td>
                <td className='p-4 font-medium text-gray-800'>{currency}{car.pricePerDay} / day</td>
                <td className='p-4'>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${car.isAvailable ?? car.isAvaliable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {car.isAvailable ?? car.isAvaliable ? 'Available' : 'Unavailable'}
                  </span>
                </td>

                <td className='p-4 text-center'>
                  <div className='flex items-center justify-center gap-3'>
                    <button onClick={() => toggleAvailability(car._id)} className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors' title="Toggle Visibility">
                      <img src={(car.isAvailable ?? car.isAvaliable) ? assets.eye_close_icon : assets.eye_icon} alt="Status" className='w-8 h-8 object-contain' />
                    </button>
                    <button onClick={() => deleteCarHandler(car._id)} className='p-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors' title="Delete">
                      <img src={assets.delete_icon} alt="Delete" className='w-8 h-8 object-contain' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageCars

