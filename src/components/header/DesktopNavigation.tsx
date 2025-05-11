
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, PlusCircle, Heart, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
  path: string;
  label: string;
  icon?: React.ReactNode;
  protected?: boolean;
  featureName?: string;
}

const DesktopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle protected route navigation
  const navigateProtected = (path: string, featureName: string) => {
    // Map is no longer protected, navigating directly
    if (path === '/map') {
      navigate(path);
      return;
    }
    
    // For other protected routes, require authentication
    if (user) {
      navigate(path);
    } else {
      localStorage.setItem('redirectAfterLogin', path);
      // Handle auth modal display through NavItem
      return false;
    }
    return true;
  };

  const NavItem = ({ path, label, icon, protected: isProtected, featureName }: NavItemProps) => {
    const handleClick = () => {
      if (isProtected) {
        return navigateProtected(path, featureName || '');
      } else {
        navigate(path);
        return true;
      }
    };

    return (
      <button 
        onClick={handleClick} 
        className={cn(
          "px-3 py-2 rounded-md font-medium flex items-center text-white",
          isActive(path) 
            ? "bg-white/20" 
            : "hover:bg-white/10"
        )}
      >
        {icon && icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="hidden md:flex items-center space-x-2">
      <NavItem path="/" label="Home" />
      <NavItem path="/map" label="Explore" icon={<MapPin className="h-4 w-4 mr-1" />} />
      <NavItem 
        path="/add" 
        label="Share" 
        icon={<PlusCircle className="h-4 w-4 mr-1" />}
        protected 
        featureName="Add Place" 
      />
      <NavItem 
        path="/search" 
        label="Search" 
        icon={<Search className="h-4 w-4 mr-1" />}
        protected 
        featureName="Search Users" 
      />
      <NavItem 
        path="/saved" 
        label="Saved" 
        icon={<Heart className="h-4 w-4 mr-1" />}
        protected 
        featureName="Saved Places" 
      />
    </div>
  );
};

export default DesktopNavigation;
