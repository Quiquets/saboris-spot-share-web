
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

  // Add a key to prevent React reconciliation issues with Google Maps
  // This ensures the map container is completely unmounted and remounted
  // rather than trying to update it in place, which can cause DOM conflicts
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        {/* Use key with timestamp to force fresh DOM nodes on each render */}
        <div key={`map-container-${Date.now()}`}>
          <MapSection />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default MapPage;
