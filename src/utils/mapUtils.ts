export type Location = {
  lat: number;
  lng: number;
  title: string;
  description?: string;
  photo?: string;
};

// Sample community recommendations
export const communityRecommendations: Location[] = [
  { 
    lat: 40.7580, 
    lng: -73.9855, 
    title: "Sushi Nakazawa", 
    description: "Amazing omakase experience with fresh fish flown in daily from Japan."
  },
  { 
    lat: 40.7610, 
    lng: -73.9840, 
    title: "Osteria Morini", 
    description: "Incredible homemade pasta and regional Italian cuisine from Emilia-Romagna."
  },
  { 
    lat: 40.7540, 
    lng: -73.9870, 
    title: "Sadelle's", 
    description: "Best brunch spot with delicious bagels, lox, and sticky buns."
  },
  { 
    lat: 40.7515, 
    lng: -73.9780, 
    title: "Xian Famous Foods", 
    description: "Authentic hand-pulled noodles with spicy cumin lamb."
  },
  { 
    lat: 40.7598, 
    lng: -73.9910, 
    title: "Los Tacos No. 1", 
    description: "Authentic Mexican tacos with homemade tortillas."
  }
];

// Script loading management
const SCRIPT_ID = 'google-maps-script';
const API_KEY = 'AIzaSyDtlKxZhiMEgLtnbdBTpc5ly6-_lJqWnVQ';

let mapsLoadState = {
  isLoading: false,
  isLoaded: false,
  scriptElement: null as HTMLScriptElement | null,
  loadPromise: null as Promise<void> | null,
  callbackName: '',
}

/**
 * Safely loads the Google Maps API script
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  // If already loaded, return immediately
  if (window.google?.maps && mapsLoadState.isLoaded) {
    console.log("Google Maps API already loaded");
    return Promise.resolve();
  }
  
  // If currently loading, return existing promise
  if (mapsLoadState.isLoading && mapsLoadState.loadPromise) {
    console.log("Google Maps API loading in progress");
    return mapsLoadState.loadPromise;
  }
  
  // Create new loading promise
  mapsLoadState.isLoading = true;
  mapsLoadState.loadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Create unique callback name
      const callbackName = `initGoogleMaps${Date.now()}`;
      mapsLoadState.callbackName = callbackName;
      
      // Define callback function
      window[callbackName] = () => {
        console.log("Google Maps initialized");
        mapsLoadState.isLoaded = true;
        mapsLoadState.isLoading = false;
        resolve();
        // We'll keep the callback reference to avoid any issues with DOM cleanup
      };
      
      // Check for existing script tag - but do NOT try to remove it
      // This avoids the removeChild error
      const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (existingScript) {
        console.log("Found existing Google Maps script, will use it");
        // Don't remove it, that causes the removeChild error
        // Just return since the script is already loaded or loading
        mapsLoadState.scriptElement = existingScript;
        return;
      }
      
      // Only create a new script if one doesn't exist
      if (!existingScript) {
        // Create script element
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=beta&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        script.onerror = (e) => {
          console.error('Google Maps failed to load:', e);
          cleanupGoogleMapsScript();
          mapsLoadState.isLoading = false;
          reject(new Error('Google Maps failed to load. Check API key or network connection.'));
        };
        
        // Store reference to script element
        mapsLoadState.scriptElement = script;
        
        // Append to document head
        document.head.appendChild(script);
      }
    } catch (error) {
      mapsLoadState.isLoading = false;
      mapsLoadState.loadPromise = null;
      reject(error);
    }
  });
  
  return mapsLoadState.loadPromise;
};

/**
 * Safely cleans up Google Maps script
 * Avoid DOM removal operations that could cause errors
 */
export const cleanupGoogleMapsScript = (): void => {
  // Don't try to remove the script at all - just clean up references
  // This avoids the removeChild errors
  
  // Clear callback if it exists
  if (mapsLoadState.callbackName && window[mapsLoadState.callbackName]) {
    try {
      delete window[mapsLoadState.callbackName];
    } catch (e) {
      window[mapsLoadState.callbackName] = undefined;
    }
  }
  
  // Reset load state
  mapsLoadState.isLoaded = false;
  mapsLoadState.isLoading = false;
  mapsLoadState.loadPromise = null;
  
  // Don't try to remove the script element - just nullify the reference
  mapsLoadState.scriptElement = null;
};

/**
 * Gets the user's current location with improved error handling
 */
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          console.warn('Error getting user location:', error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  });
};

/**
 * Safe wrapper for geolocation that handles errors properly
 */
export const safeGetUserLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError | Error) => void
): void => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by your browser'));
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    onSuccess,
    onError,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};
