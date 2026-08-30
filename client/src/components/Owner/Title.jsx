import React from 'react'

const Title = ({ title, subtitle }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  )
}

export default Title
