
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Define the interface for Google Places predictions
interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
}

interface PlaceAutocompleteProps {
  value: string;
  onPlaceSelect: (details: PlaceDetails) => void;
  disabled?: boolean;
}

export function PlaceAutocomplete({ value, onPlaceSelect, disabled }: PlaceAutocompleteProps) {
  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  
  useEffect(() => {
    // Initialize Google Places services
    if (window.google && window.google.maps) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      // Need a DOM element for PlacesService even if we don't show the map
      const mapDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(mapDiv);
      
      // Create a new session token for better pricing
      autocompleteSessionToken.current = new google.maps.places.AutocompleteSessionToken();
    }
    
    return () => {
      // Clean up
      autocompleteSessionToken.current = null;
    };
  }, []);
  
  // Update input when value prop changes
  useEffect(() => {
    setInput(value);
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    
    if (newInput.length > 2 && autocompleteService.current) {
      setIsLoading(true);
      setShowPredictions(true);
      
      const request = {
        input: newInput,
        sessionToken: autocompleteSessionToken.current,
        types: ['establishment'],
        componentRestrictions: { country: 'us' }, // Limit to US, adjust as needed
      };
      
      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setIsLoading(false);
          
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setPredictions([]);
            return;
          }
          
          setPredictions(predictions);
        }
      );
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };
  
  const handlePredictionClick = (prediction: Prediction) => {
    if (placesService.current && autocompleteSessionToken.current) {
      setIsLoading(true);
      
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['name', 'formatted_address', 'geometry'],
          sessionToken: autocompleteSessionToken.current,
        },
        (place, status) => {
          setIsLoading(false);
          setShowPredictions(false);
          
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            console.error('Error fetching place details');
            return;
          }
          
          // Create a new token for the next place search
          autocompleteSessionToken.current = new google.maps.places.AutocompleteSessionToken();
          
          const placeDetails: PlaceDetails = {
            name: place.name || '',
            address: place.formatted_address || '',
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            place_id: prediction.place_id,
          };
          
          setInput(placeDetails.name);
          onPlaceSelect(placeDetails);
        }
      );
    }
  };
  
  const handleClickOutside = () => {
    // Add a small delay to allow the click to register on the prediction
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };
  
  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a restaurant or bar..."
          value={input}
          onChange={handleInputChange}
          onFocus={() => {
            if (input.length > 2) {
              setShowPredictions(true);
            }
          }}
          onBlur={handleClickOutside}
          disabled={disabled}
          className="w-full"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      {showPredictions && predictions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handlePredictionClick(prediction)}
            >
              <div className="font-medium">
                {prediction.structured_formatting.main_text}
              </div>
              <div className="text-sm text-gray-500">
                {prediction.structured_formatting.secondary_text}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
