
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
        {/* Use key and suppressHydrationWarning to prevent React from
            trying to remount and diff the map container, which causes
            the "removeChild" error when Google Maps manipulates the DOM */}
        <div key="map-section-wrapper" suppressHydrationWarning>
          <MapSection />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default MapPage;
