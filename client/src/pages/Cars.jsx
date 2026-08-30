import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CarCards from '../components/CarCards'
import Title from '../components/Title'
import { dummyCarData, assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import{motion} from 'motion/react'

const Cars = () => {
  const { cars, axios } = useAppContext()
  const [searchParams] = useSearchParams()

  const pickupLocation = searchParams.get('pickupLocation') || searchParams.get('location')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const [input, setInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCity, setSelectedCity] = useState('All')
  const [searchedCars, setSearchedCars] = useState(null)

  const isSearchData = Boolean(pickupLocation && pickupDate && returnDate)
  
  const searchCarAvailability = async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availablity', {
        location: pickupLocation,
        pickupDate,
        returnDate
      })
      if (data.success) {
        setSearchedCars(data.availableCars)
        if (data.availableCars.length === 0) {
          toast('No Cars Available')
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability()
    }
  }, [pickupLocation, pickupDate, returnDate])

  useEffect(() => {
    if (pickupLocation) {
      setSelectedCity(pickupLocation)
    }
    const query = searchParams.get('search')
    if (query) {
      setInput(query)
    }
  }, [searchParams])

  const categories = ['All', 'SUV', 'Sedan']
  const carSource = searchedCars !== null
    ? searchedCars
    : (cars && cars.length > 0) ? cars : dummyCarData

  const filteredCars = carSource.filter((car) => {
    const matchSearch =
      !input.trim() ||
      `${car.brand} ${car.model} ${car.category} ${car.location}`
        .toLowerCase()
        .includes(input.toLowerCase())

    const matchCategory =
      selectedCategory === 'All' || car.category === selectedCategory

    const matchCity = selectedCity === 'All' || car.location === selectedCity

    return matchSearch && matchCategory && matchCity
  })

  return (
    <div>
      {/* Header & Search Bar */}
      <motion.div 
      initial={{opacity:0, y:30}}
      animate={{opacity:1, y:30}}
      transition={{ duration:0.6, ease:'easeOut'}}
      className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title
          title='Available Cars'
          subTitle='Browse our selection of premium vehicles available for your next adventure'
        />

        <motion.div 
        initial={{opacity:0, y:20}}
        animate={{opacity:1, y:0}}
        transition={{ delay:0.3, duration:0.6}}
        className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow border border-borderColor/50'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2 opacity-60' />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Search by make, model, or features'
            className='w-full h-full outline-none text-gray-500 placeholder:text-gray-400 text-sm'
          />

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2 opacity-60' />
        </motion.div>
      </motion.div>

      {/* Main Cars Section */}
      <div className='py-12 px-6 md:px-16 lg:px-24 xl:px-32 min-h-[60vh]'>
        {/* Filter controls */}
        <div className='flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-borderColor'>
          <div className='flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0'>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm rounded-full cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white font-medium'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-borderColor'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className='px-4 py-2 border border-borderColor rounded-xl text-sm bg-white text-gray-700 outline-none cursor-pointer'
          >
            <option value='All'>All Locations</option>
            {cityList.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Car list section with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className='mt-6'
        >
          <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

          {/* Car list grid */}
          {filteredCars.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
              {filteredCars.map((car, index) => (
                <motion.div 
                initial={{ opacity: 0, y:20 }}
                animate={{ opacity: 1, y:0 }}
                transition={{ delay: 0.1*index, duration: 0.5 }}
                key={car._id || index}>
                  <CarCards car={car} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='text-center py-20 bg-white rounded-2xl border border-borderColor mt-4'>
              <p className='text-gray-500 text-lg font-medium'>
                No cars match your search or selected filters.
              </p>
              <button
                onClick={() => {
                  setInput('')
                  setSelectedCategory('All')
                  setSelectedCity('All')
                }}
                className='mt-4 px-6 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dull cursor-pointer'
              >
                Reset Filters
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Cars