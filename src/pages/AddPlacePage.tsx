
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AddPlaceForm } from '@/components/places/AddPlaceForm';
import { loadGoogleMapsScript } from '@/utils/mapUtils';

const AddPlacePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    document.title = 'Saboris - Share a Place';
    
    // Load Google Maps API
    loadGoogleMapsScript()
      .then(() => {
        setIsMapLoading(false);
      })
      .catch(err => {
        console.error("Error loading Google Maps:", err);
        setIsMapLoading(false);
      });
  }, []);

  if (authLoading || isMapLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin text-saboris-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Sign In Required</h1>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Please sign in to add new places.</p>
            <Button onClick={() => navigate('/')} className="bg-saboris-primary hover:bg-saboris-primary/90 text-sm md:text-base">
              Go to Home
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
  
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 flex-grow">
        <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-saboris-primary flex items-center justify-center">
          <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2" />
          Share recommendations
        </h1>
        <AddPlaceForm />
      </div>
      <Footer />
    </main>
  );
};

export default AddPlacePage;
