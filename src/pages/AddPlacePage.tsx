
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AddPlaceForm } from '@/components/places/AddPlaceForm';
import { loadGoogleMapsScript } from '@/utils/mapUtils';

const AddPlacePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Saboris - Share a Place';
    
    // Load Google Maps API
    loadGoogleMapsScript().catch(err => {
      console.error("Error loading Google Maps:", err);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-saboris-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to add new places.</p>
            <Button onClick={() => navigate('/')} className="bg-saboris-primary hover:bg-saboris-primary/90">
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
      <AddPlaceForm />
      <Footer />
    </main>
  );
};

export default AddPlacePage;
