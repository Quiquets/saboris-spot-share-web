
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, Filter, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SavedRestaurant, supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import MapFilters from '@/components/map/MapFilters';
import { ActiveFilters, FilterChangeHandler, PeopleFilterChangeHandler } from '@/components/map/FilterOptions';

const SavedPlacesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<SavedRestaurant[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<SavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    people: 'community',
    occasion: [],
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "desc",
    serviceSortDirection: "desc",
    atmosphereSortDirection: "desc",
    valueSortDirection: "desc"
  });
  const [placeReviews, setPlaceReviews] = useState<{[key: string]: any[]}>({});

  useEffect(() => {
    document.title = 'Saboris - Saved Places';
    
    const fetchSavedPlaces = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const places = await supabaseService.getSavedRestaurants(user.id);
        setSavedPlaces(places);
        setFilteredPlaces(places);
        
        // Fetch reviews for each saved place
        const reviewsPromises = places.map(place => 
          supabase.from('reviews')
            .select(`*, users(name, username, avatar_url)`)
            .eq('place_id', place.place_id)
        );
        
        const reviewsResults = await Promise.all(reviewsPromises);
        
        const reviewsData: {[key: string]: any[]} = {};
        reviewsResults.forEach((result, index) => {
          if (result.data) {
            reviewsData[places[index].place_id] = result.data;
          }
        });
        
        setPlaceReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching saved places:", error);
        toast.error("Failed to load saved places");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedPlaces();
  }, [user]);

  useEffect(() => {
    // Apply filters to saved places
    if (savedPlaces.length === 0) return;
    
    let filtered = [...savedPlaces];
    
    // Apply cuisine filter (foodType)
    if (activeFilters.foodType.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant.tags && 
        place.restaurant.tags.some(tag => activeFilters.foodType.includes(tag))
      );
    }
    
    // Apply price filter
    if (activeFilters.price.length > 0) {
      filtered = filtered.filter(place => {
        const priceLevel = getPriceLevel(place);
        return activeFilters.price.includes(priceLevel);
      });
    }
    
    // Apply vibe filter
    if (activeFilters.vibe.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant.tags && 
        place.restaurant.tags.some(tag => activeFilters.vibe.includes(tag))
      );
    }
    
    // Apply occasion filter
    if (activeFilters.occasion.length > 0) {
      filtered = filtered.filter(place => 
        place.restaurant.tags && 
        place.restaurant.tags.some(tag => activeFilters.occasion.includes(tag))
      );
    }
    
    setFilteredPlaces(filtered);
  }, [savedPlaces, activeFilters]);

  const handleRemoveFromWishlist = async (placeId: string) => {
    if (!user) return;
    
    try {
      await supabaseService.unsaveRestaurant(user.id, placeId);
      setSavedPlaces(currentPlaces => 
        currentPlaces.filter(place => place.place_id !== placeId)
      );
      setFilteredPlaces(currentPlaces => 
        currentPlaces.filter(place => place.place_id !== placeId)
      );
      toast.success("Removed from saved places");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };
  
  const handleFilterChange: FilterChangeHandler = (type, value) => {
    if (typeof value === 'object' && 'direction' in value) {
      // Handle sort direction changes
      const { direction, category } = value;
      setActiveFilters(prev => ({
        ...prev,
        [`${category}SortDirection`]: direction
      }));
    } else if (Array.isArray(value)) {
      // Handle array type filters (occasion, foodType, vibe, price)
      setActiveFilters(prev => ({
        ...prev,
        [type]: value
      }));
    } else {
      // Handle other filters
      setActiveFilters(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };
  
  const handlePeopleFilterChange: PeopleFilterChangeHandler = (value) => {
    setActiveFilters(prev => ({
      ...prev,
      people: value
    }));
  };
  
  const toggleSortDirection = (category: string) => {
    const directionKey = `${category}SortDirection` as keyof ActiveFilters;
    const currentDirection = activeFilters[directionKey];
    
    setActiveFilters(prev => ({
      ...prev,
      [directionKey]: currentDirection === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Helper function to determine price level based on restaurant data
  const getPriceLevel = (place: SavedRestaurant) => {
    if (!place.restaurant.tags) return 'medium';
    
    if (place.restaurant.tags.includes('budget') || place.restaurant.tags.includes('cheap')) {
      return 'low';
    } else if (place.restaurant.tags.includes('expensive') || place.restaurant.tags.includes('luxury')) {
      return 'high';
    } else if (place.restaurant.tags.includes('premium')) {
      return 'premium';
    }
    
    return 'medium';
  };
  
  // Helper function to get average rating from reviews
  const getAverageRating = (reviews: any[] = []): number => {
    if (reviews.length === 0) return 0;
    
    let sum = 0;
    let count = 0;
    
    reviews.forEach(review => {
      if (review.rating_food) {
        sum += review.rating_food;
        count++;
      }
      if (review.rating_service) {
        sum += review.rating_service;
        count++;
      }
      if (review.rating_atmosphere) {
        sum += review.rating_atmosphere;
        count++;
      }
    });
    
    return count > 0 ? sum / count : 0;
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-saboris-primary border-gray-200"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-12V3m0 0v2m0-2h2M9 3h2m10 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your saved places.</p>
            <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
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
      
      <div className="bg-gray-50 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="text-saboris-primary" />
              <span>My Saved Places</span>
            </h1>
            
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </Button>
          </div>
          
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <MapFilters 
                activeFilters={activeFilters}
                handleFilterChange={handleFilterChange}
                handlePeopleFilterChange={handlePeopleFilterChange}
                toggleSortDirection={toggleSortDirection}
              />
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-saboris-primary border-gray-200 mx-auto mb-3"></div>
              <p className="text-gray-600">Loading your saved places...</p>
            </div>
          ) : filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => {
                const placeReviewsData = placeReviews[place.place_id] || [];
                const averageRating = getAverageRating(placeReviewsData);
                
                return (
                  <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img 
                        src={`https://source.unsplash.com/random/400x300?restaurant,${place.restaurant.name}`}
                        alt={place.restaurant.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{place.restaurant.name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-saboris-primary"
                          onClick={() => handleRemoveFromWishlist(place.place_id)}
                        >
                          <Heart className="h-5 w-5 fill-saboris-primary" />
                        </Button>
                      </div>
                      
                      {place.restaurant.category && (
                        <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full">
                          {place.restaurant.category}
                        </span>
                      )}
                      
                      {averageRating > 0 && (
                        <div className="mt-1 flex items-center gap-1">
                          {renderStars(averageRating)}
                          <span className="text-sm text-gray-500 ml-1">
                            ({placeReviewsData.length} {placeReviewsData.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="py-2">
                      {place.restaurant.description && (
                        <p className="text-sm text-gray-600 mb-2">{place.restaurant.description}</p>
                      )}
                      
                      {place.note && (
                        <div className="mt-2 text-sm italic text-gray-500 p-2 bg-gray-50 rounded-md">"{place.note}"</div>
                      )}
                      
                      {/* Friend reviews section */}
                      {placeReviewsData.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold mb-1">Reviews from friends:</h4>
                          <div className="space-y-3 mt-2">
                            {placeReviewsData.slice(0, 2).map((review) => (
                              <div key={review.id} className="flex gap-2 p-2 bg-gray-50 rounded-md">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={review.users?.avatar_url || undefined} />
                                  <AvatarFallback>{review.users?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <p className="text-xs font-semibold">{review.users?.name}</p>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2">{review.text}</p>
                                </div>
                              </div>
                            ))}
                            
                            {placeReviewsData.length > 2 && (
                              <p className="text-xs text-saboris-primary">+ {placeReviewsData.length - 2} more reviews</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {place.restaurant.tags && place.restaurant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {place.restaurant.tags.slice(0, 5).map((tag, index) => (
                            <span 
                              key={index} 
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {place.restaurant.tags.length > 5 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              +{place.restaurant.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-0 pb-3">
                      <Button variant="outline" size="sm" className="w-full text-saboris-primary border-saboris-primary">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>View on Map</span>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-xl font-medium mb-2">No saved places match your filters</h3>
              {showFilters ? (
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
              ) : (
                <p className="text-gray-600 mb-4">Start exploring and save your favorite restaurants</p>
              )}
              <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
                <Link to="/map">
                  <MapPin className="h-4 w-4 mr-1" />
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
