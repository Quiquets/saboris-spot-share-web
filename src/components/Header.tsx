
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, PlusCircle, Heart, User, LogOut, Search, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import AccessGateModal from './AccessGateModal';
import { toast } from 'sonner';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateFeature, setGateFeature] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
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
  
  // Check if current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle protected route navigation
  const navigateProtected = (path: string, featureName: string) => {
    if (user) {
      navigate(path);
    } else {
      setGateFeature(featureName);
      setShowGateModal(true);
      // Save intended path for redirect after login
      localStorage.setItem('redirectAfterLogin', path);
    }
  };
  
  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
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

      <div className="hidden md:flex items-center space-x-2">
        <button 
          onClick={() => navigate('/')} 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center text-white",
            isActive('/') 
              ? "bg-white/20" 
              : "hover:bg-white/10"
          )}
        >
          <span>Home</span>
        </button>
        
        <button 
          onClick={() => navigateProtected('/map', 'the Map')} 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center text-white",
            isActive('/map') 
              ? "bg-white/20" 
              : "hover:bg-white/10"
          )}
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span>Explore</span>
        </button>
        
        <button 
          onClick={() => navigateProtected('/saved', 'Saved Places')} 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center text-white",
            isActive('/saved') 
              ? "bg-white/20" 
              : "hover:bg-white/10"
          )}
        >
          <Heart className="h-4 w-4 mr-1" />
          <span>Saved</span>
        </button>
        
        <button 
          onClick={() => navigateProtected('/add', 'Add Place')} 
          className={cn(
            "px-3 py-2 rounded-md font-medium flex items-center text-white",
            isActive('/add') 
              ? "bg-white/20" 
              : "hover:bg-white/10"
          )}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>Share</span>
        </button>
        
        {user ? (
          <Button 
            onClick={() => navigate('/profile')}
            className={cn(
              "ml-2 p-0 w-9 h-9 rounded-full border border-white overflow-hidden",
              isActive('/profile') ? "bg-white/20" : "bg-transparent hover:bg-white/10"
            )}
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="bg-white/50 text-saboris-primary">
                {user.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Button 
            className="bg-white text-saboris-primary border border-saboris-primary px-4 hover:bg-white hover:text-saboris-primary hover:border-saboris-primary"
            onClick={() => setIsAuthModalOpen(true)}
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
              {user && (
                <div className="flex items-center p-2 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/')}
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => navigateProtected('/map', 'the Map')}
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/map') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <MapPin className="h-4 w-4 mr-2" /> Explore
              </button>
              
              <button 
                onClick={() => navigateProtected('/saved', 'Saved Places')}
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/saved') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <Heart className="h-4 w-4 mr-2" /> Saved
              </button>
              
              <button 
                onClick={() => navigateProtected('/add', 'Add Place')}
                className={cn(
                  "px-4 py-2 font-medium rounded-md flex items-center",
                  isActive('/add') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                )}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Share
              </button>
              
              {user ? (
                <>
                  <button 
                    onClick={() => navigate('/profile')}
                    className={cn(
                      "px-4 py-2 font-medium rounded-md flex items-center",
                      isActive('/profile') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
                    )}
                  >
                    <User className="h-4 w-4 mr-2" /> Profile
                  </button>
                  
                  <hr className="my-2" />
                  
                  <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 font-medium hover:bg-gray-100 rounded-md flex items-center text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 font-medium bg-white text-saboris-primary border border-saboris-primary rounded-md flex items-center"
                >
                  <User className="h-4 w-4 mr-2" /> Sign In
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Access Gate Modal */}
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)} 
        featureName={gateFeature}
      />
    </header>
  );
};

export default Header;
