import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets, dummyCarData } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const ManageCars = () => {
  const { axios, currency, token, locations, addLocation, fetchCars: refreshGlobalCars } = useAppContext()
  const [cars, setCars] = useState(dummyCarData)
  const [editingCar, setEditingCar] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newImages, setNewImages] = useState([])
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [newLocationInput, setNewLocationInput] = useState('')

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
        if (refreshGlobalCars) refreshGlobalCars()
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
        if (refreshGlobalCars) refreshGlobalCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEditClick = (car) => {
    setEditingCar({ ...car })
    setNewImages([])
    setIsAddingLocation(false)
    setNewLocationInput('')
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!editingCar || isUpdating) return

    setIsUpdating(true)
    try {
      const formData = new FormData()
      formData.append('carId', editingCar._id)
      formData.append('carData', JSON.stringify(editingCar))

      if (newImages.length > 0) {
        newImages.forEach((img) => formData.append('images', img))
        formData.append('image', newImages[0])
      }

      const { data } = await axios.post('/api/owner/update-car', formData)
      if (data.success) {
        toast.success(data.message || "Car updated successfully!")
        setEditingCar(null)
        fetchOwnerCars()
        if (refreshGlobalCars) refreshGlobalCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOwnerCars()
    }
  }, [token])

  return (
    <div>
      <Title title="Manage Cars" subTitle="View, update pricing & edit your listed fleet" align="left" />

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
                <td className='p-4 font-semibold text-gray-800'>{currency}{car.pricePerDay} / day</td>
                <td className='p-4'>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${car.isAvailable ?? car.isAvaliable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {car.isAvailable ?? car.isAvaliable ? 'Available' : 'Unavailable'}
                  </span>
                </td>

                <td className='p-4 text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    {/* Edit button */}
                    <button
                      onClick={() => handleEditClick(car)}
                      className='p-2 hover:bg-blue-50 text-primary rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-xs font-medium'
                      title="Edit Car Details & Price"
                    >
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Toggle visibility */}
                    <button onClick={() => toggleAvailability(car._id)} className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors' title="Toggle Visibility">
                      <img src={(car.isAvailable ?? car.isAvaliable) ? assets.eye_close_icon : assets.eye_icon} alt="Status" className='w-7 h-7 object-contain' />
                    </button>

                    {/* Delete button */}
                    <button onClick={() => deleteCarHandler(car._id)} className='p-2 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer transition-colors' title="Delete">
                      <img src={assets.delete_icon} alt="Delete" className='w-7 h-7 object-contain' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Car Modal */}
      {editingCar && (
        <div onClick={() => setEditingCar(null)} className='fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'>
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 my-8 border border-borderColor'
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between pb-4 border-b border-borderColor'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>Edit Vehicle Details</h2>
                <p className='text-xs text-gray-400 mt-0.5'>{editingCar.brand} {editingCar.model} • Modify price, specs, or location</p>
              </div>
              <button
                onClick={() => setEditingCar(null)}
                className='w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors'
              >
                ✕
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdateSubmit} className='mt-6 space-y-5 text-sm text-gray-600'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {/* Brand */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Brand</label>
                  <input
                    type="text"
                    required
                    value={editingCar.brand || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
                  />
                </div>

                {/* Model */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Model</label>
                  <input
                    type="text"
                    required
                    value={editingCar.model || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
                  />
                </div>

                {/* Daily Price (Highlight) */}
                <div className='bg-primary/5 p-3 rounded-xl border border-primary/20 sm:col-span-2'>
                  <label className='block text-xs font-bold text-primary uppercase mb-1'>
                    Daily Rental Price ({currency})
                  </label>
                  <div className='relative flex items-center'>
                    <span className='absolute left-3.5 text-gray-500 font-bold'>{currency}</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingCar.pricePerDay || ''}
                      onChange={(e) => setEditingCar({ ...editingCar, pricePerDay: Number(e.target.value) })}
                      className='w-full pl-8 pr-4 py-2.5 bg-white border border-primary/40 rounded-lg text-sm font-semibold outline-none focus:border-primary text-gray-800'
                    />
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Year</label>
                  <input
                    type="number"
                    required
                    value={editingCar.year || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, year: Number(e.target.value) })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
                  />
                </div>

                {/* Seating Capacity */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Seating Capacity</label>
                  <input
                    type="number"
                    required
                    value={editingCar.seating_capacity || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, seating_capacity: Number(e.target.value) })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
                  />
                </div>

                {/* Category */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Category</label>
                  <select
                    value={editingCar.category || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, category: e.target.value })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Transmission</label>
                  <select
                    value={editingCar.transmission || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, transmission: e.target.value })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
                  >
                    <option value="Manual">Manual</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Fuel Type</label>
                  <select
                    value={editingCar.fuel_type || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, fuel_type: e.target.value })}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-xs font-semibold text-gray-600 uppercase'>Location</label>
                    {!isAddingLocation && (
                      <button
                        type="button"
                        onClick={() => setIsAddingLocation(true)}
                        className='text-xs text-primary hover:underline font-medium cursor-pointer'
                      >
                        + New
                      </button>
                    )}
                  </div>
                  <select
                    value={isAddingLocation ? 'ADD_NEW' : editingCar.location || ''}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') {
                        setIsAddingLocation(true)
                      } else {
                        setIsAddingLocation(false)
                        setEditingCar({ ...editingCar, location: e.target.value })
                      }
                    }}
                    className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
                  >
                    {locations.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    <option value="ADD_NEW">+ Add New Location</option>
                  </select>

                  {isAddingLocation && (
                    <div className='mt-2 flex items-center gap-1.5'>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={newLocationInput}
                        onChange={(e) => setNewLocationInput(e.target.value)}
                        className='flex-1 px-2.5 py-1.5 border border-borderColor rounded-lg text-xs outline-none focus:border-primary'
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newLocationInput.trim()) {
                            const added = addLocation(newLocationInput.trim())
                            setEditingCar({ ...editingCar, location: added })
                            setIsAddingLocation(false)
                            setNewLocationInput('')
                            toast.success(`"${added}" added!`)
                          }
                        }}
                        className='px-2.5 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-dull cursor-pointer'
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Description</label>
                <textarea
                  rows="3"
                  value={editingCar.description || ''}
                  onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                  className='w-full px-3.5 py-2.5 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
                />
              </div>

              {/* Photos Section */}
              <div>
                <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>
                  Update Car Photos (Optional)
                </label>
                <div className='flex items-center gap-3'>
                  {editingCar.image && (
                    <img src={editingCar.image} alt="current" className='w-16 h-12 object-cover rounded-lg border border-borderColor' />
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewImages(Array.from(e.target.files))}
                    className='text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dull cursor-pointer'
                  />
                </div>
                {newImages.length > 0 && (
                  <p className='text-xs text-green-600 mt-1 font-medium'>✓ {newImages.length} new photos selected for upload</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end gap-3 pt-4 border-t border-borderColor'>
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
                  className='px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className='px-6 py-2.5 bg-primary hover:bg-primary-dull text-white font-medium rounded-xl transition-colors shadow-md cursor-pointer disabled:opacity-50'
                >
                  {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCars

