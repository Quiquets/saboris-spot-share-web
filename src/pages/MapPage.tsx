
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { loadGoogleMapsScript } from '@/utils/mapUtils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const MapPage = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    document.title = 'Saboris - Explore';
    
    // Load Google Maps API
    const loadMap = async () => {
      try {
        setIsLoading(true);
        await loadGoogleMapsScript();
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        toast.error("Failed to load map. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMap();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-saboris-primary">
          Explore restaurants, cafes and bars near you
        </h1>
        <div className="flex-grow w-full">
          {isLoading ? (
            <div className="h-[400px] md:h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-saboris-primary" />
                <p className="text-lg">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapSection simplified={false} />
          )}
        </div>
      </div>
      <Footer />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </main>
  );
};

export default MapPage;
