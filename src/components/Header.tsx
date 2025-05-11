
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, PlusCircle, Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    });
  }
  
  // Check if current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header 
      className={cn(
        "sticky top-0 w-full z-50 transition-all duration-300 px-4 md:px-8 py-4 flex items-center justify-between bg-saboris-primary",
        isScrolled ? "shadow-sm" : ""
      )}
    >
      <div className="flex items-center">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
            alt="Saboris Logo" 
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold text-white">
            Saboris
          </span>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-2">
        <Link 
          to="/map" 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center text-white",
            isActive('/map') 
              ? "bg-white/20" 
              : "hover:bg-white/10"
          )}
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span>Map</span>
        </Link>
        
        <Link 
          to="/add" 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center text-white",
            isActive('/add') 
              ? "bg-white/20" 
              : "hover:bg-white/10"
          )}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>Add Place</span>
        </Link>
        
        {user ? (
          <Link 
            to="/profile" 
            className={cn(
              "px-3 py-2 rounded-md font-medium flex items-center text-white",
              isActive('/profile') 
                ? "bg-white/20" 
                : "hover:bg-white/10"
            )}
          >
            <User className="h-4 w-4 mr-1" />
            <span>Profile</span>
          </Link>
        ) : (
          <Button 
            className="bg-white text-saboris-primary border border-saboris-primary px-4 hover:bg-white hover:text-saboris-primary hover:border-saboris-primary"
            onClick={() => window.location.href = '/'}
          >
            <span>Sign In</span>
          </Button>
        )}
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className="p-2 text-white">
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 pt-8">
              <Link 
                to="/map" 
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/map') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <MapPin className="h-4 w-4 mr-2" /> Map
              </Link>
              
              <Link 
                to="/add" 
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/add') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Place
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className={cn(
                      "px-4 py-2 font-medium rounded-md flex items-center",
                      isActive('/profile') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                    )}
                  >
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Link>
                  
                  <hr className="my-2" />
                  
                  <button 
                    onClick={signOut}
                    className="px-4 py-2 font-medium hover:bg-gray-100 rounded-md flex items-center text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </button>
                </>
              ) : (
                <Link 
                  to="/" 
                  className="px-4 py-2 font-medium bg-white text-saboris-primary border border-saboris-primary rounded-md flex items-center"
                >
                  <User className="h-4 w-4 mr-2" /> Sign In
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
