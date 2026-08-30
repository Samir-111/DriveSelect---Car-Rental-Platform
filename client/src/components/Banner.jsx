import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import {motion} from 'motion/react'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{  opacity: 1, y: 0 }}
    transition={{ duration: 0.6}}
    className='px-6 md:px-16 lg:px-24 xl:px-32 py-12'>
      <div className='bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between text-white relative overflow-hidden shadow-2xl'>
        {/* Left content */}
        <div className='max-w-xl z-10 text-center lg:text-left'>
          <h2 className='text-3xl md:text-4xl font-bold leading-tight mb-4'>
            Do You Own a Luxury Car?
          </h2>
          <p className='text-gray-200 text-base md:text-lg mb-8 leading-relaxed'>
            Monetize your vehicle easily with our trusted platform. Earn passive income while we handle verified drivers, insurance coverage, and secure payouts.
          </p>
          <motion.button
          whileHover={{scale: 1.05}}
          whileTap={{scale:0.95}}
            onClick={() => navigate('/owner/add-car')}
            className='px-8 py-3.5 bg-primary hover:bg-primary-dull text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer hover:scale-105 active:scale-95'
          >
            List Your Car
          </motion.button>
        </div>

        {/* Right image */}
        <div className='mt-8 lg:mt-0 z-10 flex justify-center'>
          <motion.img
          initial={{opacity:0, x:50}}
          whileInView={{opacity:1,x:0}}
          teansition={{duration:0.6, delay:0.4}}
            src={assets.banner_car_image}
            alt='Banner Car'
            className='w-full max-w-lg object-contain transform hover:scale-105 transition-transform duration-500'
          />
        </div>

        {/* Background glow effects */}
        <div className='absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none' />
      </div>
    </motion.div>
  )
}

export default Banner
