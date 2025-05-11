
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SharedPlace } from '@/types/profile';
import { Filter, Loader2, MapPin, PlusCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface SharedPlacesProps {
  loading: boolean;
  sharedPlaces: SharedPlace[];
  openReviewDialog: (place: SharedPlace) => void;
}

const SharedPlaces = ({ loading, sharedPlaces, openReviewDialog }: SharedPlacesProps) => {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('shared');

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setFilterDialogOpen(false);
    // Apply filtering logic here
  };

  return (
    <>
      <Tabs defaultValue="shared" onValueChange={(value) => setActiveTab(value)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="shared" className="px-4 py-2 data-[state=active]:bg-white">
              Shared Places
            </TabsTrigger>
          </TabsList>
          
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
                <div className="font-medium text-gray-800">Sort by</div>
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
        
        <TabsContent value="shared">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-saboris-primary" />
              <p className="text-gray-600">Loading your shared places...</p>
            </div>
          ) : sharedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedPlaces.map((place) => (
                <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openReviewDialog(place)}>
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img 
                      src={place.place.image_url || `https://source.unsplash.com/random/400x300?food&${place.place.name}`}
                      alt={place.place.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-800">{place.place.name}</CardTitle>
                    </div>
                    {place.place.category && (
                      <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full">
                        {place.place.category}
                      </span>
                    )}
                    {place.rating && (
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < place.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="py-2">
                    {place.review_text ? (
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-gray-800">What made this place special?</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{place.review_text}</p>
                      </div>
                    ) : place.place.description ? (
                      <p className="text-sm text-gray-600 line-clamp-2">{place.place.description}</p>
                    ) : null}
                    
                    {place.place.tags && place.place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {place.place.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {place.place.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            +{place.place.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-0 pb-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-saboris-primary border-saboris-primary"
                      asChild
                    >
                      <Link to={`/map?place=${place.place_id}`}>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>View on Map</span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-xl font-medium mb-2 text-gray-800">No shared places yet</h3>
              <p className="text-gray-600 mb-4">Start adding your favorite places to share with others</p>
              <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
                <Link to="/add-place">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add a New Place
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add Place CTA */}
      <div className="mt-10 text-center">
        <Link to="/add-place">
          <Button className="bg-saboris-primary hover:bg-saboris-primary/90 flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add a New Place
          </Button>
        </Link>
      </div>
    </>
  );
};

export default SharedPlaces;
