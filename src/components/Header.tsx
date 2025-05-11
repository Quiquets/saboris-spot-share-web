
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccessGateModal from './AccessGateModal';
import AuthModal from './AuthModal';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import UserMenu from './header/UserMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateFeature, setGateFeature] = useState<string>('');
  const { showAuthModal, setShowAuthModal } = useAuth();
  
  // Track scrolling for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={cn(
        "sticky top-0 w-full z-50 transition-all duration-300 px-4 md:px-8 py-4 flex items-center justify-between bg-saboris-primary",
        isScrolled ? "shadow-sm" : ""
      )}
    >
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
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

      {/* Desktop Navigation */}
      <DesktopNavigation />
      <div className="hidden md:block">
        <UserMenu />
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger className="p-2 text-white">
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <MobileNavigation />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Access Gate Modal */}
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)} 
        featureName={gateFeature}
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;
