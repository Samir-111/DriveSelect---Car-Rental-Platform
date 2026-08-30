import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import{motion} from 'motion/react'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-gray-400 pt-16 pb-8 px-6 md:px-16 lg:px-24 xl:px-32 border-t border-gray-800'>
      <motion.div
      initial={{opacity:0, y:23}}
      whileInView={{opacity:1, y:0}}
      transition={{ duration:0.6}}

      className='grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800'>
        {/* Brand column */}
        <motion.div
        initial={{opacity:0, y:20}}
        whileInView={{opacity:1, y:0}}
        transition={{delay:0.6, duration:0.2}}
          
          className='flex flex-col items-start gap-4 md:col-span-1'>
          <motion.img 
          initial={{opacity:0}}
          whileInView={{opacity:1}}
          transition={{delay:0.3, duration:0.5}}
             
             src={assets.logo} alt='logo' className='h-8 brightness-200' />


          <motion.p 
          initial={{opacity:0}}
          whileInView={{opacity:1}}
          transition={{delay:0.3, duration:0.5}}

          className='text-sm leading-relaxed text-gray-400'>
            Premium luxury car rental platform. Drive your dream car with ultimate comfort, security, and peace of mind.
          </motion.p>

          <motion.div 
          initial={{opacity:0}}
          whileInView={{opacity:1}}
          transition={{delay:0.5, duration:0.5}}

          className='flex items-center gap-4 mt-2'>
            <a href='#' aria-label='Facebook' className='hover:opacity-80 transition-opacity'>
              <img 
              src={assets.facebook_logo} alt='Facebook' className='h-5 w-5' />
            </a>
            <a href='#' aria-label='Instagram' className='hover:opacity-80 transition-opacity'>
              <img src={assets.instagram_logo} alt='Instagram' className='h-5 w-5' />
            </a>
            <a href='#' aria-label='Twitter' className='hover:opacity-80 transition-opacity'>
              <img src={assets.twitter_logo} alt='Twitter' className='h-5 w-5' />
            </a>
          </motion.div>
        </motion.div>

        

        <motion.div 
        initial={{opacity:0, y:20}}
        whileInView={{opacity:1, y:0}}
        transition={{delay:0.4, duration:0.6}}
        
        className='md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8 w-full'>
          {/* Quick links */}
          <div>
            <h2 className='text-base font-medium text-white uppercase mb-4'>Quick Links</h2>
            <ul className='flex flex-col gap-2.5 text-sm'>
              <li><Link to='/' className='hover:text-white transition-colors'>Home</Link></li>
              <li><Link to='/cars' className='hover:text-white transition-colors'>Browse Cars</Link></li>
              <li><Link to='/my-bookings' className='hover:text-white transition-colors'>My Bookings</Link></li>
              <li><Link to='/owner' className='hover:text-white transition-colors'>Owner Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h2 className='text-base font-medium text-white uppercase mb-4'>Resources</h2>
            <ul className='flex flex-col gap-2.5 text-sm'>
              <li><a href='#' className='hover:text-white transition-colors'>Help Center</a></li>
              <li><a href='#' className='hover:text-white transition-colors'>Terms of Service</a></li>
              <li><a href='#' className='hover:text-white transition-colors'>Privacy Policy</a></li>
              <li><a href='#' className='hover:text-white transition-colors'>Insurance</a></li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h2 className='text-base font-medium text-white uppercase mb-4'>Contact</h2>
            <ul className='flex flex-col gap-2.5 text-sm'>
              <li>1234 Luxury Drive</li>
              <li>San Francisco, CA 94107</li>
              <li>+1 234567890</li>
              <li>info@example.com</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
      initial={{opacity:0, y:10}}
      whileInView={{opacity:1, y:0}}
      transition={{delay:0.6, duration:0.6}}
      
      className='flex flex-col sm:flex-row items-center justify-between text-xs pt-8 text-gray-500 gap-4'>
        <p>© {new Date().getFullYear()} Car Rental. All rights reserved.</p>
        <div className='flex items-center gap-6'>
          <a href='#' className='hover:text-gray-400 transition-colors'>Privacy Policy</a>
          <a href='#' className='hover:text-gray-400 transition-colors'>Terms of Service</a>
          <a href='#' className='hover:text-gray-400 transition-colors'>Cookie Settings</a>
        </div>
      </motion.div>
    </footer>
  )
}

export default Footer
