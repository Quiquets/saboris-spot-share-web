
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CitySearchProps {
  onCitySelect: (location: { lat: number; lng: number }, placeName: string) => void;
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const initializeServices = () => {
    if (window.google?.maps?.places) {
      if (!autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
      }
      if (!placesService.current) {
        // Create a dummy map element for PlacesService
        const dummyMap = new google.maps.Map(document.createElement('div'));
        placesService.current = new google.maps.places.PlacesService(dummyMap);
      }
    }
  };

  const searchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      initializeServices();
      
      if (!autocompleteService.current) {
        throw new Error('Google Maps Places service not available');
      }

      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          types: ['geocode', 'establishment'], // Include both addresses and places
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions = predictions.slice(0, 5).map(prediction => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text || '',
            }));
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      searchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setIsSearching(true);
    setSearchValue(suggestion.description);
    setShowSuggestions(false);

    try {
      initializeServices();
      
      if (!placesService.current) {
        throw new Error('Google Maps Places service not available');
      }

      placesService.current.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ['geometry', 'name', 'formatted_address'],
        },
        (place, status) => {
          setIsSearching(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const location = place.geometry.location;
            const placeName = place.name || place.formatted_address || suggestion.description;
            
            onCitySelect(
              { lat: location.lat(), lng: location.lng() },
              placeName
            );
            
            toast.success(`Navigated to ${placeName}`);
            setSearchValue('');
          } else {
            toast.error('Location not found. Please try a different search term.');
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
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow suggestion clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="p-4 mb-4 bg-white shadow-sm relative">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#EE8C80' }} />
          <Input
            value={searchValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Search for cities, streets, or places..."
            className="pl-10 pr-4"
            disabled={isSearching}
          />
        </div>

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.placeId}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium text-sm text-gray-900">
                  {suggestion.mainText}
                </div>
                {suggestion.secondaryText && (
                  <div className="text-xs text-gray-500">
                    {suggestion.secondaryText}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CitySearch;
