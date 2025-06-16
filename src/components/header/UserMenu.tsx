
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, MapPin, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
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
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    console.log('UserMenu: Profile clicked, user:', user);
    if (user && user.id) {
      console.log('UserMenu: Navigating to profile with user ID:', user.id);
      navigate(`/profile/${user.id}`);
    } else {
      console.log('UserMenu: No user ID available, navigating to /profile');
      navigate('/profile');
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
          <DropdownMenuItem onClick={handleProfileClick}>
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
