
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
          className="h-10 w-auto"
        />
      </div>
      <div className="text-sm font-medium">
        <span className={cn(
          "transition-colors",
          isScrolled ? "text-saboris-primary" : "text-white"
        )}>
          Saboris app coming soon...
        </span>
      </div>
    </header>
  );
};

export default Header;
