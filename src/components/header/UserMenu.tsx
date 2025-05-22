import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, MapPin, PlusCircle } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict
import { toast } from 'sonner';
// import { useIsMobile } from '@/hooks/use-mobile'; // useIsMobile not used in current logic, can be removed if not planned
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserMenu = () => {
  const { user, signOut, setShowAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // const isMobile = useIsMobile(); // Not currently used
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
      // toast.success("Successfully signed out"); // AuthContext already shows a toast on sign out
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  if (user) {
    const avatarSrc = user.avatar_url ? `${user.avatar_url}?v=${Date.now()}` : undefined;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className={cn(
              "ml-2 p-0 w-9 h-9 rounded-full border border-white overflow-hidden",
              isActive('/profile') || isActive(`/profile/${user.id}`) ? "ring-2 ring-white ring-offset-2 ring-offset-saboris-primary" : "bg-transparent hover:bg-white/10"
            )}
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={avatarSrc} alt={user.name || "User Avatar"} className="object-cover h-full w-full" />
              <AvatarFallback className="bg-white/50 text-saboris-primary">
                {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-gray-800">{user.name || user.username}</p>
              {user.username && (
                <p className="text-xs leading-none">
                  <span className="text-saboris-primary">@</span>
                  <span className="text-muted-foreground">{user.username}</span>
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
            <UserIcon className="h-4 w-4 mr-2" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/map')}>
            <MapPin className="h-4 w-4 mr-2" />
            <span>Explore Map</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/add-place')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Share Experience</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:!text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button 
      variant="outline"
      className="bg-white text-saboris-primary border-saboris-primary hover:bg-saboris-primary hover:text-white"
      onClick={() => setShowAuthModal(true)}
    >
      Sign In
    </Button>
  );
};

export default UserMenu;
