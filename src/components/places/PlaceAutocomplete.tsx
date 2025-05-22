import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { getUserLocation } from "@/utils/mapUtils";

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
  photos?: string[];
}

interface PlaceAutocompleteProps {
  value: string;
  onPlaceSelect: (details: PlaceDetails) => void;
  disabled?: boolean;
  types?: string[]; // Allowed types
  placeholder?: string;
}

export function PlaceAutocomplete({
  value,
  onPlaceSelect,
  disabled,
  types = ['restaurant', 'cafe', 'bar'], // Only allow these types by default
  placeholder = "Search for a restaurant, bar, or café..." // Default placeholder
}: PlaceAutocompleteProps) {
  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [userLoc, setUserLoc] = useState<google.maps.LatLng | null>(null); // Renamed to avoid conflict

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Initialize Google Places API services and get user location when component mounts
  useEffect(() => {
    const initGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Initializing Google Places services for PlaceAutocomplete");
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const mapDiv = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(mapDiv);
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

        // Get user location
        getUserLocation()
          .then(position => {
            const latLng = new google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            setUserLoc(latLng); // Use renamed state setter
            console.log("User location set for PlaceAutocomplete:", position.coords.latitude, position.coords.longitude);
          })
          .catch(error => {
            console.warn("Could not get user location for PlaceAutocomplete:", error);
          });
      } else {
        console.warn("Google Maps API not loaded yet for PlaceAutocomplete, retrying in 500ms");
        setTimeout(initGooglePlaces, 500);
      }
    };
    
    initGooglePlaces();
    
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
    
    if (newInput.length > 0 && autocompleteService.current && autocompleteSessionToken.current) {
      setIsLoading(true);
      setShowPredictions(true);
      
      const request: google.maps.places.AutocompletionRequest = {
        input: newInput,
        sessionToken: autocompleteSessionToken.current,
        types: types, // Only allow restaurants, cafes, bars
      };
      
      if (userLoc && types.some(t => t === 'establishment' || t === 'restaurant' || t === 'cafe' || t === 'bar')) {
        request.location = userLoc;
        request.radius = 50000;
      }
      
      autocompleteService.current.getPlacePredictions(
        request,
        (newPredictions, status) => {
          setIsLoading(false);
          if (status !== google.maps.places.PlacesServiceStatus.OK || !newPredictions) {
            setPredictions([]);
            return;
          }
          // Filter predictions to only those that are restaurants, cafes, bars, or locals
          const allowedTypes = ['restaurant', 'cafe', 'bar', 'food', 'point_of_interest'];
          const filtered = newPredictions.filter(pred =>
            pred.types?.some(type => allowedTypes.includes(type))
          );
          setPredictions(filtered);
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
          fields: ['name', 'formatted_address', 'geometry', 'photos', 'address_components'], // Added address_components
          sessionToken: autocompleteSessionToken.current,
        },
        (place, status) => {
          setIsLoading(false);
          setShowPredictions(false);
          autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken(); // Refresh token

          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            console.error('Error fetching place details');
            return;
          }
          
          // Create a new token for the next place search
          const photoUrls: string[] = [];
          if (place.photos && place.photos.length > 0) {
            place.photos.slice(0, 1).forEach(photo => { // Take first photo
              if (photo && typeof photo.getUrl === 'function') {
                photoUrls.push(photo.getUrl({ maxWidth: 800, maxHeight: 600 }));
              }
            });
          }

          // For city types, we might want to extract just the city name
          // For now, we'll use formatted_address for cities or name for establishments
          let displayName = place.name || '';
          if (types.includes('(cities)') && place.address_components) {
            const cityComponent = place.address_components.find(comp => comp.types.includes('locality'));
            const countryComponent = place.address_components.find(comp => comp.types.includes('country'));
            if (cityComponent) {
              displayName = cityComponent.long_name;
              if (countryComponent) {
                displayName += `, ${countryComponent.short_name}`;
              }
            } else {
              // Fallback if specific city component not found but it is a city type search
              displayName = place.formatted_address || prediction.description;
            }
          }

          const placeDetails: PlaceDetails = {
            name: displayName, // Use modified display name
            address: place.formatted_address || '',
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            place_id: prediction.place_id,
            photos: photoUrls,
          };
          
          setInput(placeDetails.name); // Set input to the (potentially) city name
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
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onFocus={() => {
            if (input.length > 0 && predictions.length > 0) { // Show if there are predictions
              setShowPredictions(true);
            }
          }}
          onBlur={handleClickOutside}
          disabled={disabled}
          className="w-full border-2 focus:border-saboris-primary rounded-xl"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-saboris-primary" />
          </div>
        )}
      </div>
      
      {showPredictions && predictions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handlePredictionClick(prediction)} // Changed to onMouseDown
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
