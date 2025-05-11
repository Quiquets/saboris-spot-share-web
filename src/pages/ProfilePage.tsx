
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin, ExternalLink } from 'lucide-react';

const ProfilePage = () => {
  useEffect(() => {
    document.title = 'Saboris - Profile';
  }, []);

  // Placeholder data
  const user = {
    name: 'Jane Doe',
    username: 'jane_foodie',
    bio: 'Food enthusiast exploring tasty spots all around the city!',
    location: 'New York, NY'
  };

  // Placeholder saved places
  const savedPlaces = [
    { 
      id: '1', 
      name: 'Sushi Nakazawa', 
      description: 'Amazing omakase experience',
      category: 'Japanese',
      photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200'
    },
    { 
      id: '2', 
      name: 'Los Tacos No. 1', 
      description: 'Authentic Mexican tacos with homemade tortillas',
      category: 'Mexican',
      photo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a3479b?q=80&w=200'
    },
    { 
      id: '3', 
      name: 'Xian Famous Foods', 
      description: 'Hand-pulled noodles with spicy cumin lamb',
      category: 'Chinese',
      photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=200'
    },
    { 
      id: '4', 
      name: 'Levain Bakery', 
      description: 'Best cookies in the city',
      category: 'Bakery',
      photo: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200'
    },
    { 
      id: '5', 
      name: 'Joe's Shanghai', 
      description: 'Famous for soup dumplings',
      category: 'Chinese',
      photo: 'https://images.unsplash.com/photo-1541696490-8744a5dc0228?q=80&w=200'
    },
    { 
      id: '6', 
      name: 'Prince Street Pizza', 
      description: 'Square slices with pepperoni cups',
      category: 'Pizza',
      photo: 'https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?q=80&w=200'
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-saboris-primary">
                <AvatarImage src="https://i.pravatar.cc/150?img=23" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">@{user.username}</p>
                <p className="mt-2">{user.bio}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  {user.location}
                </p>
              </div>
              
              <div>
                <Button variant="outline" className="border-saboris-primary text-saboris-primary">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
          
          {/* Saved Places Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="text-saboris-primary" />
                <span>My Saved Places</span>
              </h2>
              
              <Link to="/map">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>View on Map</span>
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlaces.map((place) => (
                <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img 
                      src={place.photo} 
                      alt={place.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{place.name}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-saboris-primary">
                        <Heart className="h-5 w-5 fill-saboris-primary" />
                      </Button>
                    </div>
                    <span className="inline-block px-2 py-1 bg-saboris-light text-saboris-primary text-xs rounded-full">
                      {place.category}
                    </span>
                  </CardHeader>
                  
                  <CardContent className="py-2">
                    <p className="text-sm text-gray-600">{place.description}</p>
                  </CardContent>
                  
                  <CardFooter className="pt-0 pb-3">
                    <Button variant="outline" size="sm" className="w-full text-saboris-primary border-saboris-primary">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>View Details</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Add Place CTA */}
            <div className="mt-10 text-center">
              <Link to="/add">
                <Button className="bg-saboris-primary hover:bg-saboris-primary/90">
                  Add a New Place
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default ProfilePage;
