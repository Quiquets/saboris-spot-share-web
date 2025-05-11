
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
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
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="h-4 w-4 mr-2" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button 
      className="bg-white text-saboris-primary border border-saboris-primary px-4 hover:bg-white hover:text-saboris-primary hover:border-saboris-primary"
      onClick={() => setShowAuthModal(true)}
    >
      <span>Sign In</span>
    </Button>
  );
};

export default UserMenu;
