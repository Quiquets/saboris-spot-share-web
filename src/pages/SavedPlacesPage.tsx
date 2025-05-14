
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { SavedPlacesFilters } from '@/components/saved/SavedPlacesFilters';
import { SavedPlacesGrid } from '@/components/saved/SavedPlacesGrid';
import { SavedPlacesEmpty } from '@/components/saved/SavedPlacesEmpty';
import { SavedPlacesLoader } from '@/components/saved/SavedPlacesLoader';
import { UnauthenticatedState } from '@/components/saved/UnauthenticatedState';
import { useSavedPlaces } from '@/hooks/saved/useSavedPlaces';
import { Heart } from 'lucide-react';

const SavedPlacesPage = () => {
  const { user, loading: authLoading, setShowAuthModal } = useAuth();
  const { 
    savedPlaces, 
    friendsSavedPlaces, 
    loading, 
    activeFilters,
    handleFilterChange,
    handlePeopleFilterChange,
    toggleSortDirection,
    filteredPlaces,
    handleRemoveFromWishlist
  } = useSavedPlaces(user, setShowAuthModal);

  useEffect(() => {
    document.title = 'Saboris - Saved Places';
  }, []);

  if (authLoading) {
    return <SavedPlacesLoader />;
  }

  if (!user) {
    return <UnauthenticatedState />;
  }
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="bg-gray-50 py-4 md:py-8 px-3 md:px-4 flex-grow">
        <div className="container mx-auto">
          {/* Title with consistent styling and an icon */}
          <h1 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-saboris-primary flex items-center justify-center">
            <Heart className="h-5 w-5 md:h-6 md:w-6 mr-2" />
            My Saved Places
          </h1>
          
          {/* Filter section */}
          <SavedPlacesFilters 
            activeFilters={activeFilters}
            handleFilterChange={handleFilterChange}
            handlePeopleFilterChange={handlePeopleFilterChange}
            toggleSortDirection={toggleSortDirection}
            isUserAuthenticated={!!user}
          />
          
          {loading ? (
            <SavedPlacesLoader inline />
          ) : filteredPlaces.length > 0 ? (
            <SavedPlacesGrid 
              places={filteredPlaces}
              handleRemoveFromWishlist={handleRemoveFromWishlist}
            />
          ) : (
            <SavedPlacesEmpty />
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default SavedPlacesPage;
