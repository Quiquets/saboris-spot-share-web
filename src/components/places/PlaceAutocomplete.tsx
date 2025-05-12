
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { getUserLocation, loadGoogleMapsScript } from "@/utils/mapUtils";

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
}

export function PlaceAutocomplete({ value, onPlaceSelect, disabled }: PlaceAutocompleteProps) {
  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const placeholderDivRef = useRef<HTMLDivElement>(null);
  
  // Initialize Google Places API services and get user location when component mounts
  useEffect(() => {
    const initGooglePlaces = async () => {
      try {
        // Ensure Google Maps API is loaded
        await loadGoogleMapsScript();
        
        // Confirm the API is available
        if (!window.google?.maps?.places) {
          throw new Error('Google Maps Places API not available');
        }
        
        console.log("Initializing Google Places services");
        setIsGoogleReady(true);
        
        // Initialize the autocomplete service
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Create a placeholder div for PlacesService if not already present
        if (!placeholderDivRef.current) {
          const div = document.createElement('div');
          div.style.display = 'none';
          document.body.appendChild(div);
          placeholderDivRef.current = div;
        }
        
        // Initialize the places service with the placeholder div
        placesService.current = new window.google.maps.places.PlacesService(placeholderDivRef.current);
        
        // Create a new session token for better pricing
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        // Get user location
        try {
          const position = await getUserLocation();
          const latLng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(latLng);
        } catch (error) {
          console.warn("Could not get user location:", error);
          // Continue without user location
        }
      } catch (error) {
        console.error("Error initializing Google Places:", error);
        setIsGoogleReady(false);
      }
    };
    
    initGooglePlaces();
    
    return () => {
      // Cleanup function: remove the placeholder div if it exists
      if (placeholderDivRef.current && placeholderDivRef.current.parentNode) {
        placeholderDivRef.current.parentNode.removeChild(placeholderDivRef.current);
      }
      
      // Clear the session token
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
    
    if (newInput.length > 2 && autocompleteService.current && isGoogleReady) {
      setIsLoading(true);
      setShowPredictions(true);
      
      // Create request with location bias if available
      const request: google.maps.places.AutocompletionRequest = {
        input: newInput,
        sessionToken: autocompleteSessionToken.current || undefined,
        types: ['establishment'],
      };
      
      // If we have user location, add location bias
      if (userLocation) {
        request.location = userLocation;
        request.radius = 50000; // 50km radius
      }
      
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
    if (!placesService.current || !autocompleteSessionToken.current || !isGoogleReady) {
      console.error("Places service not initialized properly");
      return;
    }
    
    setIsLoading(true);
    
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'photos'],
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
        if (window.google?.maps?.places) {
          autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        }
        
        // Extract photo URLs if available
        const photoUrls: string[] = [];
        if (place.photos && place.photos.length > 0) {
          try {
            photoUrls.push(place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 }));
          } catch (error) {
            console.error("Error getting photo URL:", error);
          }
        }
        
        const placeDetails: PlaceDetails = {
          name: place.name || '',
          address: place.formatted_address || '',
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          place_id: prediction.place_id,
          photos: photoUrls,
        };
        
        setInput(placeDetails.name);
        onPlaceSelect(placeDetails);
      }
    );
  };
  
  const handleClickOutside = () => {
    // Add a small delay to allow the click to register on the prediction
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };
  
  if (!isGoogleReady) {
    return (
      <div className="w-full p-4 border border-gray-200 rounded-xl flex justify-center items-center">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading Google Places...</span>
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a restaurant, bar, or café..."
          value={input}
          onChange={handleInputChange}
          onFocus={() => {
            if (input.length > 2) {
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
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handlePredictionClick(prediction)}
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
