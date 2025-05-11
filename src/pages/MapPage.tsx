
import { useEffect } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';

const MapPage = () => {
  useEffect(() => {
    document.title = 'Saboris - Explore Map';
    
    // No need for cleanup here anymore - it's handled internally by MapSection
    // This avoids the removeChild error by not trying to clean up the script on unmount
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
