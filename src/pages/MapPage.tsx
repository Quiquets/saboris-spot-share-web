
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { toast } from 'sonner';

const MapPage = () => {
  const { showAuthModal, setShowAuthModal, user } = useAuth();
  const [placeImages, setPlaceImages] = useState<Record<string, string>>({});
  
  useEffect(() => {
    document.title = 'Saboris - Explore';
    
    // Fetch the most recent images for places
    const fetchRecentImages = async () => {
      try {
        // This would be a query to get the most recent review images for places
        // For example:
        const { data, error } = await supabaseService.getRecentPlaceImages();
        
        if (error) {
          console.error("Error fetching recent place images:", error);
          return;
        }
        
        if (data) {
          // Transform the data into a map of placeId -> imageUrl
          const imageMap: Record<string, string> = {};
          data.forEach(item => {
            if (item.place_id && item.photo_url) {
              imageMap[item.place_id] = item.photo_url;
            }
          });
          setPlaceImages(imageMap);
        }
      } catch (error) {
        console.error("Error in fetching recent images:", error);
      }
    };

    fetchRecentImages();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow w-full">
        <MapSection placeImagesData={placeImages} />
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
