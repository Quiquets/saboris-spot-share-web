
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import AccessGateModal from '@/components/AccessGateModal';
import SearchInput from '@/components/search/SearchInput';
import SearchResults from '@/components/search/SearchResults';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  is_following?: boolean;
  followers_count?: number;
  posts_count?: number;
}

const SearchUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const [showGateModal, setShowGateModal] = useState(false);
  
  useEffect(() => {
    if (searchQuery.length > 0) {
      searchUsers();
    }
  }, [searchQuery]);
  
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await supabaseService.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.followUser(userId);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: true, followers_count: (u.followers_count || 0) + 1 } 
          : u
      ));
      
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleUnfollowUser = async (userId: string) => {
    if (!user) {
      setShowGateModal(true);
      return;
    }
    
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await supabaseService.unfollowUser(userId);
      
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_following: false, followers_count: Math.max(0, (u.followers_count || 1) - 1) } 
          : u
      ));
      
      toast.success("User unfollowed successfully!");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-left mb-6 text-saboris-primary">
            Search for friends or restaurants
          </h1>
          
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
          
          <SearchResults
            loading={loading}
            searchQuery={searchQuery}
            users={users}
            currentUserId={user?.id}
            followLoading={followLoading}
            onFollow={handleFollowUser}
            onUnfollow={handleUnfollowUser}
          />
        </div>
      </div>
      
      <Footer />
      
      <AccessGateModal 
        isOpen={showGateModal} 
        onClose={() => setShowGateModal(false)}
        featureName="follow users"
      />
    </main>
  );
};

export default SearchUsersPage;
