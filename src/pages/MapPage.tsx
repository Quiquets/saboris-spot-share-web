
import { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';

const MapPage = () => {
  // Using a ref to track mount status
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    document.title = 'Saboris - Explore Map';
    
    return () => {
      // Mark as unmounted to prevent any async operations after unmount
      isMountedRef.current = false;
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        {/* Wrap MapSection in a stable div to prevent remounting */}
        <div key="map-section-wrapper">
          <MapSection />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default MapPage;
