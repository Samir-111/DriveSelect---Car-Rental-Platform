import React, { useState } from 'react'
import{motion} from 'motion/react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <motion.div
    initial={{opacity:0, y:30}}
    whileInView={{opacity:1, y:1}}
    transition={{duration:0.6, ease:'easeOut'}}
    viewport={{once:true, amount:0.3}}
    className='py-16 px-6 md:px-16 lg:px-24 xl:px-32 bg-white text-center'>
      <div className='max-w-2xl mx-auto flex flex-col items-center gap-4'>
        <motion.h2
        initial={{opacity:0, y:20}}
        whileInView={{opacity:1, y:0}}
        transition={{delay:0.2, duration:0.6}}

        className='text-3xl md:text-4xl font-semibold text-gray-800'>
          Subscribe & Never Miss a Deal
        </motion.h2>

        <motion.p 
        initial={{opacity:0, y:20}}
        whileInView={{opacity:1, y:0}}
        transition={{delay:0.3, duration:0.5}}
        
        className='text-gray-500 text-sm md:text-base max-w-lg'>
          Join our newsletter to receive exclusive discounts, new luxury arrivals, and personalized travel recommendations directly to your inbox.
        </motion.p>

        {subscribed ? (
          <div className='mt-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium'>
            Thank you for subscribing! Check your email for special offers.
          </div>
        ) : (
          <motion.form
          initial={{opacity:0, y:20}}
          whileInView={{opacity:1, y:0}}
          transition={{delay:0.4, duration:0.5}}

            onSubmit={handleSubmit}
            className='flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-6'
          >
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email address'
              required
              className='w-full px-4 py-3 border border-borderColor rounded-xl outline-none text-sm text-gray-700 focus:border-primary transition-colors'
            />
            <button
              type='submit'
              className='w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-dull text-white font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95'
            >
              Subscribe
            </button>
          </motion.form>
        )}
      </div>
    </motion.div>
  )
}

export default Newsletter
