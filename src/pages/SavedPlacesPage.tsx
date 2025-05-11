
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedPlacesPage = () => {
  useEffect(() => {
    document.title = 'Saboris - Saved Places';
  }, []);

  // Placeholder data
  const savedPlaces = [
    { 
      id: '1', 
      name: 'Sushi Nakazawa', 
      description: 'Amazing omakase experience',
      tags: ['Japanese', 'Sushi', 'Expensive']
    },
    { 
      id: '2', 
      name: 'Los Tacos No. 1', 
      description: 'Authentic Mexican tacos with homemade tortillas',
      tags: ['Mexican', 'Tacos', 'Affordable'] 
    },
    { 
      id: '3', 
      name: 'Xian Famous Foods', 
      description: 'Hand-pulled noodles with spicy cumin lamb',
      tags: ['Chinese', 'Noodles', 'Spicy'] 
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8 gap-2">
            <Heart className="text-saboris-primary h-6 w-6" />
            <h1 className="text-3xl font-bold">Your Saved Places</h1>
          </div>
          
          {savedPlaces.length > 0 ? (
            <div className="space-y-4">
              {savedPlaces.map(place => (
                <Card key={place.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{place.name}</h3>
                      <p className="text-gray-600 mb-2">{place.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {place.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 fill-saboris-primary text-saboris-primary" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/map">
                          <MapPin className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <Heart className="h-12 w-12 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No saved places yet</h2>
              <p className="text-gray-600 mb-6">
                Explore the map and save your favorite spots to see them here.
              </p>
              <Button asChild>
                <Link to="/map" className="flex items-center gap-2">
                  Explore Map <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default SavedPlacesPage;
