
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    });
  }
  
  return (
    <header 
      className={cn(
        "fixed w-full z-50 transition-all duration-300 px-4 md:px-8 py-4 flex items-center justify-between",
        isScrolled ? "bg-white/90 shadow-sm backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
          alt="Saboris Logo" 
          className="h-12 w-auto"
        />
        <span className={cn(
          "ml-2 text-xl font-bold transition-colors",
          isScrolled ? "text-saboris-primary" : "text-white"
        )}>
          Saboris
        </span>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Link 
          to="/about" 
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            isScrolled ? "text-saboris-primary hover:text-saboris-primary/80" : "text-white hover:text-white/80"
          )}
        >
          Who We Are
        </Link>
        
        <span className="bg-white text-[#EE8C80] px-3 py-1 text-sm rounded-full font-semibold shadow">
          📱 App coming soon
        </span>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className={cn(
            "p-2",
            isScrolled ? "text-saboris-primary" : "text-white"
          )}>
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 pt-8">
              <Link to="/about" className="px-4 py-2 font-medium hover:bg-gray-100 rounded-md">
                Who We Are
              </Link>
              <div className="px-4">
                <span className="bg-saboris-primary/10 text-saboris-primary px-3 py-1 text-sm rounded-full font-semibold inline-block">
                  📱 App coming soon
                </span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
