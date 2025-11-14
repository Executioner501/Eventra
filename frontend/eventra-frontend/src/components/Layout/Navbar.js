import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/">
            <div className="cursor-pointer">
              <h1 className="text-2xl font-bold text-blue-600">Eventra</h1>
              <p className="text-xs text-gray-500">College Event Management</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/home">
              <span className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer">
                Events
              </span>
            </Link>
            <Link href="/home?filter=workshop">
              <span className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer">
                Workshops
              </span>
            </Link>
            <Link href="/home?filter=movie">
              <span className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer">
                Screenings
              </span>
            </Link>
            <Link href="/home?filter=other">
              <span className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer">
                Culturals
              </span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium border border-gray-300 rounded-md hover:border-blue-600 transition">
              Verify Tickets
            </button>
            <Link href="/admin/login">
              <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition">
                Admin Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;