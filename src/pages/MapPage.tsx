
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { loadGoogleMapsScript } from '@/utils/mapUtils';
import { toast } from 'sonner';

const MapPage = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  useEffect(() => {
    document.title = 'Saboris - Explore';
    
    // Load Google Maps API
    const loadMap = async () => {
      try {
        await loadGoogleMapsScript();
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        toast.error("Failed to load map. Please refresh the page.");
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
          {isMapLoaded ? (
            <MapSection simplified={false} />
          ) : (
            <div className="h-[400px] md:h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-lg">Loading map...</p>
            </div>
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
