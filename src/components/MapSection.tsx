
import React, { useState, useEffect } from 'react';
import GoogleMapView from './map/GoogleMapView';
import MapFilters from './map/MapFilters';
import { ActiveFilters, FilterChangeHandler, PeopleFilterChangeHandler } from './map/FilterOptions';

interface MapSectionProps {
  placeImagesData?: Record<string, string>;
}

const MapSection: React.FC<MapSectionProps> = ({ placeImagesData = {} }) => {
  // Initialize active filters with empty values
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    people: 'community',
    occasion: [],
    foodType: [],
    vibe: [],
    price: [],
    rating: 0,
    foodSortDirection: "asc",
    serviceSortDirection: "asc",
    atmosphereSortDirection: "asc",
    valueSortDirection: "asc"
  });
  
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 37.7749,
    lng: -122.4194, // Default to San Francisco
  });
  
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
  
  // Handle filter change
  const handleFilterChange: FilterChangeHandler = (type, value) => {
    setActiveFilters(prev => {
      if (type === 'occasion' || type === 'foodType' || type === 'vibe' || type === 'price') {
        return {
          ...prev,
          [type]: value as string[]
        };
      } else if (typeof value === 'object' && 'direction' in value) {
        // Handle sort direction change
        return {
          ...prev,
          [`${value.category}SortDirection`]: value.direction
        };
      } else {
        return {
          ...prev,
          [type]: value
        };
      }
    });
    
    // Here you would also fetch filtered places from your API
    console.log("Filters updated:", type, value);
  };
  
  // Handle people filter change
  const handlePeopleFilterChange: PeopleFilterChangeHandler = (value) => {
    setActiveFilters(prev => ({
      ...prev,
      people: value
    }));
    console.log("People filter updated:", value);
  };
  
  // Toggle sort direction
  const toggleSortDirection = (category: string) => {
    setActiveFilters(prev => {
      const directionKey = `${category}SortDirection` as keyof ActiveFilters;
      const currentDirection = prev[directionKey] as "asc" | "desc";
      const newDirection = currentDirection === "asc" ? "desc" : "asc";
      
      return {
        ...prev,
        [directionKey]: newDirection
      };
    });
  };
  
  return (
    <div className="w-full h-[calc(100vh-64px)] relative">
      <MapFilters
        activeFilters={activeFilters}
        handleFilterChange={handleFilterChange}
        handlePeopleFilterChange={handlePeopleFilterChange}
        toggleSortDirection={toggleSortDirection}
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
