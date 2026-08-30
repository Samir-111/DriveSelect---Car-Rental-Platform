import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets, cityList } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const AddCar = () => {
  const { currency, axios, fetchCars } = useAppContext()
  const [image, setImage] = useState(null)

  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    seating_capacity: '',
    fuel_type: '',
    transmission: '',
    pricePerDay: '',
    location: '',
    description: '',
  })

  const [isLoading, setIsloading] = useState(false)
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if(isLoading) return null 

    setIsloading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('carData', JSON.stringify(car))

      const {data} = await axios.post('/api/owner/add-car', formData)

      if(data.success){
        toast.success(data.message)
        fetchCars()
        setImage(null)
        setCar({
          brand: '',
          model: '',
          year: '',
          category: '',
          seating_capacity: '',
          fuel_type: '',
          transmission: '',
          pricePerDay: '',
          location: '',
          description: '',
        })
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }finally{
      setIsloading(false)
    }
  }

  return (
    <div className='max-w-4xl px-4 pt-10 md:px-10 flex-1 pb-16'>
      <Title title="Add New Car" subTitle="List a new vehicle for rental" align="left" />

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>
        {/* Car Image */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="car-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt=""
              className='h-14 rounded cursor-pointer'
            />
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        {/* Car Details */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Brand</label>
            <input
              type="text"
              placeholder="e.g. BMW, Mercedes, Audi"
              required
              value={car.brand}
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Model</label>
            <input
              type="text"
              placeholder="e.g. X5, C-Class, A4"
              required
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
            />
          </div>

          {/* Year */}
          <div className='flex flex-col w-full'>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Year</label>
            <input
              type="number"
              placeholder="2025"
              required
              value={car.year}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
            />
          </div>

          {/* Daily Price */}
          <div>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Daily Price ({currency})</label>
            <input
              type="number"
              placeholder="100"
              required
              value={car.pricePerDay}
              onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
            />
          </div>

          {/* Category */}
          <div className='flex flex-col w-full'>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Category</label>
            <select
              value={car.category}
              required
              onChange={(e) => setCar({ ...car, category: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
            >
              <option value="">Select a category</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Van">Van</option>
            </select>
          </div>

          {/* Transmission */}
          <div className='flex flex-col w-full'>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Transmission</label>
            <select
              value={car.transmission}
              required
              onChange={(e) => setCar({ ...car, transmission: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
            >
              <option value="">Select transmission</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div className='flex flex-col w-full'>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Fuel Type</label>
            <select
              value={car.fuel_type}
              required
              onChange={(e) => setCar({ ...car, fuel_type: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
            >
              <option value="">Select fuel type</option>
              <option value="Gasoline">Gasoline</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          {/* Seating Capacity */}
          <div className='flex flex-col w-full'>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Seating Capacity</label>
            <input
              type="number"
              placeholder="5"
              required
              value={car.seating_capacity}
              onChange={(e) => setCar({ ...car, seating_capacity: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
            />
          </div>

          {/* Location */}
          <div className='flex flex-col w-full'>
            <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Location</label>
            <select
              value={car.location}
              required
              onChange={(e) => setCar({ ...car, location: e.target.value })}
              className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary bg-white cursor-pointer'
            >
              <option value="">Select a location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Car Description */}
        <div>
          <label className='block text-xs font-semibold text-gray-600 uppercase mb-2'>Description</label>
          <textarea
            rows="4"
            required
            placeholder="Provide a detailed description of the car..."
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
            className='w-full px-4 py-3 border border-borderColor rounded-xl text-sm outline-none focus:border-primary'
          ></textarea>
        </div>

        <button
          type="submit"
          className='flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dull transition-colors cursor-pointer self-start'
        >
          <img src={assets.tick_icon} alt="" />
          {isLoading ? 'Listing...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  )
}

export default AddCar

