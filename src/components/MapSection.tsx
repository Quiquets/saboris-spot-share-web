
import { useEffect, useRef } from 'react';

const MapSection = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // For now, let's use a placeholder for the map
    // In a real implementation, you would initialize a map library here
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;
    
    mapContainer.innerHTML = `
      <div class="flex items-center justify-center h-full bg-saboris-lightGray">
        <div class="text-center">
          <div class="mb-4">🗺️</div>
          <h3 class="text-xl font-medium text-gray-700">Interactive Map</h3>
          <p class="text-sm text-gray-500">Discover recommended places in your area</p>
        </div>
      </div>
    `;
    
    // Cleanup function
    return () => {
      if (mapContainer) mapContainer.innerHTML = '';
    };
  }, []);
  
  return (
    <section id="map" className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Great Spots</h2>
        <p className="text-gray-600">Browse through real recommendations from our community</p>
      </div>
      
      <div ref={mapContainerRef} className="map-container shadow-lg"></div>
    </section>
  );
};

export default MapSection;
