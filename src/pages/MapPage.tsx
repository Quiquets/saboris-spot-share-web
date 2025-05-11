
import { useEffect } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import { cleanupGoogleMapsScript } from '@/utils/mapUtils';

const MapPage = () => {
  useEffect(() => {
    document.title = 'Saboris - Explore Map';
    
    // Cleanup function when component unmounts
    return () => {
      // Wait a bit before cleanup to prevent race conditions
      setTimeout(() => {
        cleanupGoogleMapsScript();
      }, 100);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <MapSection />
      </div>
      <Footer />
    </main>
  );
};

export default MapPage;
