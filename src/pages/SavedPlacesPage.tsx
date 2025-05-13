import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SavedRestaurant, supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MapFilters from '@/components/map/MapFilters';
import { ActiveFilters } from '@/components/map/FilterOptions';

const SavedPlacesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Add state for filters
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    people: 'community', // Default to Saboris Community
    occasion: [],
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "desc", // Default: high to low
    serviceSortDirection: "desc", // Default: high to low
    atmosphereSortDirection: "desc", // Default: high to low
    valueSortDirection: "desc", // Default: high to low
    sortDirection: "desc", // Added for compatibility
  });

  useEffect(() => {
    document.title = 'Saboris - Saved Places';
    
    const fetchSavedPlaces = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const places = await supabaseService.getSavedRestaurants(user.id);
        setSavedPlaces(places);
      } catch (error) {
        console.error("Error fetching saved places:", error);
        toast.error("Failed to load saved places");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedPlaces();
  }, [user]);

  const handleRemoveFromWishlist = async (placeId: string) => {
    if (!user) return;
    
    try {
      await supabaseService.unsaveRestaurant(user.id, placeId);
      setSavedPlaces(currentPlaces => 
        currentPlaces.filter(place => place.place_id !== placeId)
      );
      toast.success("Removed from saved places");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };
  
  const handleFilterChange = (type: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const handlePeopleFilterChange = (value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      people: value
    }));
  };
  
  const toggleSortDirection = (category: string) => {
    const directionKey = {
      'value': 'valueSortDirection',
      'food-quality': 'foodSortDirection',
      'service': 'serviceSortDirection',
      'atmosphere': 'atmosphereSortDirection'
    }[category] as keyof ActiveFilters;
    
    if (directionKey) {
      const currentDirection = activeFilters[directionKey] as "asc" | "desc";
      const newDirection = currentDirection === "desc" ? "asc" : "desc";
      
      setActiveFilters(prev => ({
        ...prev,
        [directionKey]: newDirection,
        sortDirection: newDirection // Update this for compatibility
      }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="h-8 w-8 md:h-12 md:w-12 animate-spin rounded-full border-4 border-t-saboris-primary border-gray-200"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-6 md:py-16">
          <div className="max-w-md mx-auto text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16 mx-auto text-gray-300 mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-12V3m0 0v2m0-2h2M9 3h2m10 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">Sign In Required</h1>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8">Please sign in to view your saved places.</p>
            <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90 text-sm md:text-base">
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
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
          
          {/* Filter section - optimized for mobile */}
          <div className="mb-4 md:mb-6">
            <MapFilters
              activeFilters={{
                people: activeFilters.people,
                occasion: activeFilters.occasion,
                foodType: activeFilters.foodType,
                vibe: activeFilters.vibe,
                price: activeFilters.price,
                rating: activeFilters.rating.toString(),
                sortDirection: activeFilters.sortDirection || "desc"
              }}
              handleFilterChange={handleFilterChange}
              handlePeopleFilterChange={handlePeopleFilterChange}
              toggleSortDirection={toggleSortDirection}
              isUserAuthenticated={!!user}
            />
          </div>
          
          {loading ? (
            <div className="text-center py-6 md:py-12">
              <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-t-saboris-primary border-gray-200 mx-auto mb-3"></div>
              <p className="text-sm md:text-base text-gray-600">Loading your saved places...</p>
            </div>
          ) : savedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {savedPlaces.map((place) => (
                <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img 
                      src={`https://source.unsplash.com/random/400x300?restaurant,${place.restaurant.name}`}
                      alt={place.restaurant.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  <CardHeader className="py-2 md:py-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm md:text-lg line-clamp-1">{place.restaurant.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 md:h-8 md:w-8 text-saboris-primary"
                        onClick={() => handleRemoveFromWishlist(place.place_id)}
                      >
                        <Heart className="h-4 w-4 fill-saboris-primary" />
                      </Button>
                    </div>
                    
                    {place.restaurant.category && (
                      <span className="inline-block px-2 py-0.5 bg-saboris-light text-saboris-primary text-xs rounded-full">
                        {place.restaurant.category}
                      </span>
                    )}
                  </CardHeader>
                  
                  <CardContent className="py-1 md:py-2">
                    {place.restaurant.description && (
                      <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{place.restaurant.description}</p>
                    )}
                    
                    {place.note && (
                      <div className="mt-1 md:mt-2 text-xs italic text-gray-500 p-2 bg-gray-50 rounded-md line-clamp-2">"{place.note}"</div>
                    )}
                    
                    {place.restaurant.tags && place.restaurant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {place.restaurant.tags.slice(0, isMobile ? 3 : 5).map((tag, index) => (
                          <span 
                            key={index} 
                            className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {place.restaurant.tags.length > (isMobile ? 3 : 5) && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">
                            +{place.restaurant.tags.length - (isMobile ? 3 : 5)} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-0 pb-2 md:pb-3">
                    <Button variant="outline" size="sm" className="w-full text-saboris-primary border-saboris-primary text-xs py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>View on Map</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-12 bg-white rounded-lg border border-gray-100">
              <Heart className="h-10 w-10 md:h-16 md:w-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base md:text-xl font-medium mb-2">No saved places found</h3>
              <p className="text-xs md:text-base text-gray-600 mb-3 md:mb-4">Start exploring and save your favorite restaurants</p>
              <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90 text-xs md:text-base">
                <Link to="/map">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Explore Map
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default SavedPlacesPage;
