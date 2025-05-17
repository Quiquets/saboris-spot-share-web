import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Filter, Loader2, MapPin, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SharedPlaceStar } from './profile-components/SharedPlaceStar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SharedPlacesProps {
  loading: boolean;
  sharedPlaces: any[];
  openReviewDialog: (place: any) => void;
  refreshPlaces: () => Promise<void>;
}

const SharedPlaces = ({ 
  loading, 
  sharedPlaces, 
  openReviewDialog, 
  refreshPlaces 
}: SharedPlacesProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const handleDelete = async (placeId: string, placeType: string) => {
    try {
      setDeletingId(placeId);
      if (placeType === 'review') {
        const { error } = await supabase.from('reviews').delete().eq('id', placeId);
        if (error) throw error;
      } else if (placeType === 'place') {
        const { error } = await supabase.from('places').delete().eq('id', placeId);
        if (error) throw error;
        // Potentially delete associated reviews/wishlists too if this is the source of truth for place deletion
      } else {
        toast.error("Unknown item type for deletion.");
        setDeletingId(null);
        return;
      }
      
      toast.success('Item deleted successfully');
      await refreshPlaces();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setFilterDialogOpen(false);
  };
  
  return (
    <>
      <SharedPlacesHeader 
        setFilterDialogOpen={setFilterDialogOpen}
        filterDialogOpen={filterDialogOpen}
        currentFilter={currentFilter}
        handleFilterChange={handleFilterChange}
      />
      
      <SharedPlacesContent
        loading={loading}
        sharedPlaces={sharedPlaces}
        openReviewDialog={openReviewDialog}
        handleDelete={handleDelete}
        deletingId={deletingId}
        isMobile={isMobile}
      />
      
      <SharedPlacesAddButton />
    </>
  );
};

const SharedPlacesHeader = ({ 
  setFilterDialogOpen, 
  filterDialogOpen, 
  currentFilter, 
  handleFilterChange 
}: { 
  setFilterDialogOpen: (open: boolean) => void;
  filterDialogOpen: boolean;
  currentFilter: string;
  handleFilterChange: (filter: string) => void;
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-700">Your Shared Places</h2>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => setFilterDialogOpen(true)}
      >
        <Filter className="h-4 w-4" />
        <span>Filter</span>
      </Button>
      
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Places</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-2 py-4">
            <div className="font-medium text-gray-700">Sort by</div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={currentFilter === 'all' ? "default" : "outline"}
                onClick={() => handleFilterChange('all')}
                className={currentFilter === 'all' ? "bg-saboris-primary" : ""}
              >
                All
              </Button>
              
              <Button 
                variant={currentFilter === 'ratings' ? "default" : "outline"}
                onClick={() => handleFilterChange('ratings')}
                className={currentFilter === 'ratings' ? "bg-saboris-primary" : ""}
              >
                Highest Rated
              </Button>
              
              <Button 
                variant={currentFilter === 'newest' ? "default" : "outline"}
                onClick={() => handleFilterChange('newest')}
                className={currentFilter === 'newest' ? "bg-saboris-primary" : ""}
              >
                Newest First
              </Button>
              
              <Button 
                variant={currentFilter === 'oldest' ? "default" : "outline"}
                onClick={() => handleFilterChange('oldest')}
                className={currentFilter === 'oldest' ? "bg-saboris-primary" : ""}
              >
                Oldest First
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SharedPlacesContent = ({ 
  loading, 
  sharedPlaces, 
  openReviewDialog, 
  handleDelete, 
  deletingId,
  isMobile
}: { 
  loading: boolean;
  sharedPlaces: any[];
  openReviewDialog: (place: any) => void;
  handleDelete: (placeId: string, placeType: string) => Promise<void>;
  deletingId: string | null;
  isMobile: boolean;
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-saboris-primary" />
        <p className="text-gray-600">Loading your shared places...</p>
      </div>
    );
  }
  
  if (sharedPlaces.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-3" />
        <h3 className="text-xl font-medium mb-2 text-gray-700">No shared places yet</h3>
        <p className="text-gray-600 mb-4">Start adding your favorite places to share with others</p>
        <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
          <Link to="/add-place">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add a New Place
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sharedPlaces.map((place) => (
        <SharedPlaceCard 
          key={place.id}
          place={place}
          openReviewDialog={openReviewDialog}
          handleDelete={handleDelete}
          deletingId={deletingId}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

const SharedPlaceCard = ({ 
  place, 
  openReviewDialog, 
  handleDelete, 
  deletingId,
  isMobile
}: { 
  place: any;
  openReviewDialog: (place: any) => void;
  handleDelete: (placeId: string, placeType: string) => Promise<void>;
  deletingId: string | null;
  isMobile: boolean;
}) => {
  const displayImages = place.photo_urls && place.photo_urls.length > 0 
    ? place.photo_urls 
    : (place.place.image_url ? [place.place.image_url] : [`https://source.unsplash.com/random/400x300?food&${encodeURIComponent(place.place.name)}`]);

  return (
    <Card 
      key={place.id}
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
      onClick={() => openReviewDialog(place)}
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {displayImages.length > 1 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {displayImages.map((imgSrc: string, index: number) => (
                <CarouselItem key={index}>
                  <img 
                    src={imgSrc}
                    alt={`${place.place.name} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </>
            )}
          </Carousel>
        ) : (
          <img 
            src={displayImages[0]}
            alt={place.place.name} 
            className="w-full h-full object-cover"
          />
        )}
         {displayImages.length === 0 && ( // Fallback if no images at all
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
      </div>
      
      <CardHeader className="py-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-gray-700">{place.place.name}</CardTitle>
        </div>
        {place.place.category && (
          <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full mt-1">
            {place.place.category}
          </span>
        )}
        
        {place.rating !== undefined && (
          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SharedPlaceStar 
                key={i}
                filled={i < place.rating}
              />
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        {place.review_text ? (
          <div>
            <h4 className="text-sm font-medium mb-1 text-gray-700">What made this place special?</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{place.review_text}</p>
          </div>
        ) : place.place.description ? (
          <p className="text-sm text-gray-600 line-clamp-2">{place.place.description}</p>
        ) : null}
        
        {renderTags(place, isMobile)}
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 mt-auto">
        <Button asChild variant="outline" size="sm" className="w-full text-saboris-primary border-saboris-primary">
          <Link to={`/map?place=${place.place_id}`}>
            <MapPin className="h-4 w-4 mr-1" />
            <span>View on Map</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const renderTags = (place: any, isMobile: boolean) => {
  if (!place.place.tags || !place.place.tags.length) {
    return null;
  }
  
  const maxTags = isMobile ? 2 : 3;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {place.place.tags.slice(0, maxTags).map((tag: string, index: number) => (
        <span 
          key={index} 
          className="text-xs px-2 py-1 bg-gray-100 rounded-full"
        >
          {tag}
        </span>
      ))}
      {place.place.tags.length > maxTags && (
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
          +{place.place.tags.length - maxTags} more
        </span>
      )}
    </div>
  );
};

const SharedPlacesAddButton = () => {
  return (
    <div className="mt-10 text-center">
      <Link to="/add-place">
        <Button className="bg-saboris-primary hover:bg-saboris-primary/90 flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Add a New Place
        </Button>
      </Link>
    </div>
  );
};

export default SharedPlaces;
