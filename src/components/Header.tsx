
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, PlusCircle, Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
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
        "sticky top-0 w-full z-50 transition-all duration-300 px-4 md:px-8 py-4 flex items-center justify-between",
        isScrolled ? "bg-white/95 shadow-sm backdrop-blur-sm" : "bg-white"
      )}
    >
      <div className="flex items-center">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
            alt="Saboris Logo" 
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold text-saboris-primary">
            Saboris
          </span>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-2">
        <Link 
          to="/map" 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center",
            isActive('/map') 
              ? "bg-saboris-light text-saboris-primary" 
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span>Map</span>
        </Link>
        
        <Link 
          to="/add" 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center",
            isActive('/add') 
              ? "bg-saboris-light text-saboris-primary" 
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>Add Place</span>
        </Link>
        
        <Link 
          to="/saved" 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center",
            isActive('/saved') 
              ? "bg-saboris-light text-saboris-primary" 
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Heart className="h-4 w-4 mr-1" />
          <span>Saved</span>
        </Link>
        
        <div className="flex items-center gap-2 ml-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className="p-2 text-saboris-primary">
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
              
              <Link 
                to="/saved" 
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/saved') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <Heart className="h-4 w-4 mr-2" /> Saved
              </Link>
              
              <hr className="my-2" />
              
              <Link 
                to="/profile" 
                className="px-4 py-2 font-medium hover:bg-gray-100 rounded-md flex items-center"
              >
                <User className="h-4 w-4 mr-2" /> Profile
              </Link>
              
              <button className="px-4 py-2 font-medium hover:bg-gray-100 rounded-md flex items-center text-left">
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
