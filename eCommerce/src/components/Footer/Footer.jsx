import React from 'react'
import { Link } from 'react-router-dom'
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined } from '@ant-design/icons'

const Footer = () => {
  return (
    <footer className="bg-neutral-100 py-16 border-t-4 border-[#ee4d2d]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Customer Service */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase mb-4">Customer Service</div>
            <ul className="flex flex-col gap-2 text-xs text-gray-500">
              <li><Link to="/my-orders" className="text-gray-500 hover:text-[#ee4d2d]">Order Tracking</Link></li>
              <li><Link to="/user/account/profile" className="text-gray-500 hover:text-[#ee4d2d]">My Account</Link></li>
              <li><Link to="/cart" className="text-gray-500 hover:text-[#ee4d2d]">Shopping Cart</Link></li>
              <li><Link to="/checkout" className="text-gray-500 hover:text-[#ee4d2d]">Checkout</Link></li>
            </ul>
          </div>

          {/* About Shopping */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase mb-4">About Shopping</div>
            <ul className="flex flex-col gap-2 text-xs text-gray-500">
              <li><Link to="/" className="text-gray-500 hover:text-[#ee4d2d]">Home</Link></li>
              <li><Link to="/products" className="text-gray-500 hover:text-[#ee4d2d]">Shopping Mall</Link></li>
              <li><Link to="/recommendations" className="text-gray-500 hover:text-[#ee4d2d]">Our Recommendations</Link></li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase mb-4">Payment</div>
            <div className="flex flex-wrap gap-2">
               <div className="w-14 h-8 bg-white shadow-sm border border-gray-200 flex items-center justify-center p-1"><img src="https://down-vn.img.susercontent.com/file/d4bbea4570b93bfd5fc652ca82a262a8" alt="Visa" className="max-h-full max-w-full" /></div>
               <div className="w-14 h-8 bg-white shadow-sm border border-gray-200 flex items-center justify-center p-1"><img src="https://down-vn.img.susercontent.com/file/38fd98e55806c3b2e4535c4e4a6c4c08" alt="JCB" className="max-h-full max-w-full" /></div>
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase mb-4">Follow Us</div>
            <ul className="flex flex-col gap-2 text-xs text-gray-500">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#ee4d2d] flex items-center gap-2"><FacebookOutlined /> Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#ee4d2d] flex items-center gap-2"><InstagramOutlined /> Instagram</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-[#ee4d2d] flex items-center gap-2"><LinkedinOutlined /> LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-center items-center gap-4">
           <div className="text-xs text-gray-500">
             © 2024 Shopping. All Rights Reserved.
           </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer