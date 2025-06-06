
import React, { useState, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CitySearchProps {
  onCitySelect: (location: { lat: number; lng: number }, cityName: string) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);

  const initializeAutocomplete = () => {
    if (window.google?.maps?.places && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setIsSearching(true);
    
    try {
      initializeAutocomplete();
      
      if (!autocompleteService.current) {
        throw new Error('Google Maps Places service not available');
      }

      // Use Geocoding API to find the city
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address: searchValue,
          componentRestrictions: { country: '' } // Allow worldwide search
        },
        (results, status) => {
          setIsSearching(false);
          
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const cityName = results[0].formatted_address;
            
            onCitySelect(
              { lat: location.lat(), lng: location.lng() },
              cityName
            );
            
            toast.success(`Navigated to ${cityName}`);
            setSearchValue('');
          } else {
            toast.error('City not found. Please try a different search term.');
          }
        }
      );
    } catch (error) {
      setIsSearching(false);
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="p-4 mb-4 bg-white shadow-sm">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for a city (e.g., New York, Paris, Tokyo)"
            className="pl-10 pr-4"
            disabled={isSearching}
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isSearching || !searchValue.trim()}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          {isSearching ? 'Searching...' : 'Go'}
        </Button>
      </div>
    </Card>
  );
};

export default CitySearch;
