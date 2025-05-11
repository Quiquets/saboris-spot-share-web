import { Link, useLocation } from 'react-router-dom';

const DesktopNavigation = () => {
  const { pathname } = useLocation();
  
  return (
    <nav className="hidden md:flex space-x-1">
      <Link
        to="/"
        className={`px-3 py-2 rounded-md text-sm ${
          pathname === '/' ? 'text-saboris-primary font-medium' : 'text-gray-600 hover:text-saboris-primary'
        }`}
      >
        Home
      </Link>
      <Link
        to="/map"
        className={`px-3 py-2 rounded-md text-sm ${
          pathname === '/map' ? 'text-saboris-primary font-medium' : 'text-gray-600 hover:text-saboris-primary'
        }`}
      >
        Explore
      </Link>
      <Link
        to="/find-friends"
        className={`px-3 py-2 rounded-md text-sm ${
          pathname === '/find-friends' ? 'text-saboris-primary font-medium' : 'text-gray-600 hover:text-saboris-primary'
        }`}
      >
        Find Friends
      </Link>
      <Link
        to="/about"
        className={`px-3 py-2 rounded-md text-sm ${
          pathname === '/about' ? 'text-saboris-primary font-medium' : 'text-gray-600 hover:text-saboris-primary'
        }`}
      >
        About
      </Link>
    </nav>
  );
};

export default DesktopNavigation;
