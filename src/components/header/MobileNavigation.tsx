
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, PlusCircle, Heart, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MobileNavigation = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, setShowAuthModal } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle protected route navigation
  const navigateProtected = (path: string, featureName: string) => {
    if (path === '/map') {
      navigate(path);
      if (onClose) onClose();
      return true;
    }
    
    if (user) {
      navigate(path);
      if (onClose) onClose();
      return true;
    } else {
      localStorage.setItem('redirectAfterLogin', path);
      setShowAuthModal(true);
      if (onClose) onClose();
      return false;
    }
  };

  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      if (onClose) onClose();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="flex flex-col space-y-1 pt-4">
      {user && (
        <div className="flex items-center p-2 mb-2">
          <div className="ml-1">
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => { navigate('/'); if (onClose) onClose(); }}
        className={cn(
          "px-4 py-3 font-medium rounded-md flex items-center text-sm",
          isActive('/') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
        )}
      >
        <span>Home</span>
      </button>
      
      <button 
        onClick={() => { navigate('/map'); if (onClose) onClose(); }}
        className={cn(
          "px-4 py-3 font-medium rounded-md flex items-center text-sm",
          isActive('/map') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
        )}
      >
        <MapPin className="h-4 w-4 mr-3" /> Explore
      </button>
      
      <button 
        onClick={() => navigateProtected('/add', 'Add Place')}
        className={cn(
          "px-4 py-3 font-medium rounded-md flex items-center text-sm",
          isActive('/add') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
        )}
      >
        <PlusCircle className="h-4 w-4 mr-3" /> Share
      </button>
      
      <button 
        onClick={() => navigateProtected('/search', 'Search Users')}
        className={cn(
          "px-4 py-3 font-medium rounded-md flex items-center text-sm",
          isActive('/search') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
        )}
      >
        <Search className="h-4 w-4 mr-3" /> Search
      </button>
      
      <button 
        onClick={() => navigateProtected('/saved', 'Saved Places')}
        className={cn(
          "px-4 py-3 font-medium rounded-md flex items-center text-sm",
          isActive('/saved') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
        )}
      >
        <Heart className="h-4 w-4 mr-3" /> Saved
      </button>
      
      {user ? (
        <>
          <button 
            onClick={() => { navigate('/profile'); if (onClose) onClose(); }}
            className={cn(
              "px-4 py-3 font-medium rounded-md flex items-center text-sm",
              isActive('/profile') ? "bg-saboris-light text-saboris-primary" : "hover:bg-gray-100"
            )}
          >
            <User className="h-4 w-4 mr-3" /> Profile
          </button>
          
          <hr className="my-2" />
          
          <button 
            onClick={handleSignOut}
            className="px-4 py-3 font-medium hover:bg-gray-100 rounded-md flex items-center text-left text-sm"
          >
            <LogOut className="h-4 w-4 mr-3" /> Log out
          </button>
        </>
      ) : null}
    </div>
  );
};

export default MobileNavigation;
