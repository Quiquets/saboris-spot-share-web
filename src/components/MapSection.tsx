
import React, { useState, useEffect } from 'react';
import GoogleMapView from './map/GoogleMapView';
import MapFilters from './map/MapFilters';
import { filterOptions } from './map/FilterOptions';

interface MapSectionProps {
  placeImagesData?: Record<string, string>;
}

// Define interface for active filters to match the expected type
interface ActiveFilters {
  category: string;
  items: string[];
  people?: any[];
  occasion?: any[];
  foodType?: any[];
  vibe?: any[];
  priceRange?: any[];
  starRating?: number | null;
}

const MapSection: React.FC<MapSectionProps> = ({ placeImagesData = {} }) => {
  const [filters, setFilters] = useState({
    foodTypes: [],
    vibes: [],
    occasions: [],
    people: [],
    priceRanges: [],
    starRating: null,
  });
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters[]>([]);
  
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 37.7749,
    lng: -122.4194, // Default to San Francisco
  });
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Mock data for places
  const [places, setPlaces] = useState([
    {
      id: '1',
      name: 'Amour Cafe',
      lat: 37.7749,
      lng: -122.4194,
      tags: ['Cozy', 'Coffee', 'Breakfast'],
      rating: 4.5,
      priceLevel: 2,
      reviewCount: 120,
    },
    {
      id: '2',
      name: 'Bistro Central',
      lat: 37.7833,
      lng: -122.4167,
      tags: ['French', 'Wine', 'Dinner'],
      rating: 4.8,
      priceLevel: 3,
      reviewCount: 85,
    },
    {
      id: '3',
      name: 'Coastal Kitchen',
      lat: 37.7694,
      lng: -122.4862,
      tags: ['Seafood', 'Ocean View', 'Lunch'],
      rating: 4.2,
      priceLevel: 3,
      reviewCount: 210,
    },
  ]);
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Calculate active filters
    const newActiveFilters: ActiveFilters[] = [];
    
    if (newFilters.foodTypes.length > 0) {
      newActiveFilters.push({
        category: 'Cuisine',
        items: newFilters.foodTypes,
      });
    }
    
    if (newFilters.vibes.length > 0) {
      newActiveFilters.push({
        category: 'Vibe',
        items: newFilters.vibes,
      });
    }
    
    if (newFilters.occasions.length > 0) {
      newActiveFilters.push({
        category: 'Occasion',
        items: newFilters.occasions,
      });
    }
    
    if (newFilters.priceRanges.length > 0) {
      newActiveFilters.push({
        category: 'Price',
        items: newFilters.priceRanges.map((range: number) => `${'$'.repeat(range)}`),
      });
    }
    
    setActiveFilters(newActiveFilters);
    
    // Here you would also fetch filtered places from your API
    // For now, we'll just use the mock data
  };
  
  const handleRemoveFilter = (category: string, item: string) => {
    const newFilters = { ...filters };
    
    if (category === 'Cuisine') {
      newFilters.foodTypes = newFilters.foodTypes.filter((type) => type !== item);
    } else if (category === 'Vibe') {
      newFilters.vibes = newFilters.vibes.filter((vibe) => vibe !== item);
    } else if (category === 'Occasion') {
      newFilters.occasions = newFilters.occasions.filter((occasion) => occasion !== item);
    } else if (category === 'Price') {
      const priceLevel = item.length; // Count the number of $ signs
      newFilters.priceRanges = newFilters.priceRanges.filter((range) => range !== priceLevel);
    }
    
    handleFilterChange(newFilters);
  };
  
  return (
    <div className="w-full h-[calc(100vh-64px)] relative">
      <MapFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={isFiltersOpen}
        onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
      />
      <GoogleMapView
        places={places}
        center={mapCenter}
        onCenterChanged={setMapCenter}
        placeImages={placeImagesData}
      />
    </div>
  );
};

export default MapSection;
