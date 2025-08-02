import React from 'react'

const Navbar = () => {
  return (
    <nav className='bg-gray-400'>
      <div className='flex justify-between items-center px-6 py-3'>
        <div className='text-2xl font-bold'>ML Web App</div>
        <ul className='flex gap-3'>
            <li>Home</li>
            <li>About</li>
            <li>Contact Us</li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
