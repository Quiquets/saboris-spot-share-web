import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  
  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-700"
        aria-expanded="false"
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X className="block h-6 w-6" />
        ) : (
          <Menu className="block h-6 w-6" />
        )}
      </button>

      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } absolute top-16 inset-x-0 z-50 p-4 bg-white shadow-lg w-full`}
      >
        <div className="px-2 py-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base ${
              pathname === '/'
                ? 'bg-saboris-light text-saboris-primary font-medium'
                : 'text-gray-600 hover:bg-saboris-light hover:text-saboris-primary'
            }`}
          >
            Home
          </Link>
          <Link
            to="/map"
            className={`block px-3 py-2 rounded-md text-base ${
              pathname === '/map'
                ? 'bg-saboris-light text-saboris-primary font-medium'
                : 'text-gray-600 hover:bg-saboris-light hover:text-saboris-primary'
            }`}
          >
            Explore
          </Link>
          <Link
            to="/find-friends"
            className={`block px-3 py-2 rounded-md text-base ${
              pathname === '/find-friends'
                ? 'bg-saboris-light text-saboris-primary font-medium'
                : 'text-gray-600 hover:bg-saboris-light hover:text-saboris-primary'
            }`}
          >
            Find Friends
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base ${
              pathname === '/about'
                ? 'bg-saboris-light text-saboris-primary font-medium'
                : 'text-gray-600 hover:bg-saboris-light hover:text-saboris-primary'
            }`}
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
