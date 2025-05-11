
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import AccessGateModal from '@/components/AccessGateModal';
import SearchBar from '@/components/users/SearchBar';
import UserSearchResults from '@/components/users/UserSearchResults';
import { useUserSearch } from '@/hooks/useUserSearch';

const SearchUsersPage = () => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, users, loading, updateUserFollowStatus } = useUserSearch();
  const [showGateModal, setShowGateModal] = useState(false);
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Find Friends</h1>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or username"
          />
          
          <UserSearchResults
            users={users}
            loading={loading}
            searchQuery={searchQuery}
            currentUserId={user?.id}
            onFollowStatusChange={updateUserFollowStatus}
            onShowGateModal={() => setShowGateModal(true)}
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
