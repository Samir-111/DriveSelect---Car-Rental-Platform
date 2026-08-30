import React from 'react'
import Title from './Title'
import { assets } from '../assets/assets'
import{motion} from 'motion/react'

const testimonialsData = [
  {
    id: 1,
    name: 'Emily Nagpure',
    role: 'Business Executive',
    image: assets.testimonial_image_1,
    rating: 5,
    comment: 'Renting the BMW X5 for my business trip was a breeze. Seamless booking, pristine car condition, and incredible customer support throughout!'
  },
  {
    id: 2,
    name: 'Ashvini Khanna',
    role: 'Weekend Explorer',
    image: assets.testimonial_image_2,
    rating: 5,
    comment: 'The Jeep Wrangler made our coastal road trip unforgettable. Transparent pricing, no hidden fees, and hassle-free pickup and return.'
  }
]

const Testimonials = () => {
  return (
    <div className='py-20 px-6 md:px-16 lg:px-24 xl:px-32 bg-light/50'>
      <Title
        title="What Our Clients Say"
        subTitle="Read real feedback from drivers who experience luxury with us"
        align="center"
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto'>
        {testimonialsData.map((item, index) => (
          <motion.div
          initial={{opacity:0, y:40}}
          whileInView={{opacity:1, y:0}}
          transition={{duration:0.6, delay: index * 0.2, ease: 'easeOut'}}
          viewport={{once:true, amount:0.3}}

            key={item.id}
            className='bg-white p-8 rounded-2xl shadow-md border border-borderColor flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
          >
            <div>
              <div className='flex items-center gap-1 mb-4'>
                {[...Array(item.rating)].map((_, i) => (
                  <img key={i} src={assets.star_icon} alt="star" className='h-4 w-4' />
                ))}
              </div>
              <p className='text-gray-600 italic leading-relaxed text-sm md:text-base mb-6'>
                "{item.comment}"
              </p>
            </div>

            <div className='flex items-center gap-4 pt-4 border-t border-gray-100'>
              <img
                src={item.image}
                alt={item.name}
                className='w-12 h-12 rounded-full object-cover border-2 border-primary/20'
              />
              <div>
                <h4 className='font-semibold text-gray-800 text-base'>{item.name}</h4>
                <p className='text-xs text-gray-500'>{item.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Testimonials
