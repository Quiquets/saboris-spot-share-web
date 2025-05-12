
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

// State to track Google Maps script loading
let googleMapsLoadState = {
  isLoading: false,
  isLoaded: false,
  loadPromise: null as Promise<void> | null,
  callbackName: '',
};

/**
 * Safely loads the Google Maps API script with improved error handling
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  // If Google Maps API is already available, return immediately
  if (window.google?.maps) {
    console.log("Google Maps API already loaded");
    googleMapsLoadState.isLoaded = true;
    return Promise.resolve();
  }
  
  // If currently loading, return existing promise
  if (googleMapsLoadState.isLoading && googleMapsLoadState.loadPromise) {
    console.log("Google Maps API loading in progress");
    return googleMapsLoadState.loadPromise;
  }
  
  // Create a new loading promise
  googleMapsLoadState.isLoading = true;
  googleMapsLoadState.isLoaded = false;
  
  googleMapsLoadState.loadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Create a unique callback name to avoid conflicts
      const callbackName = `initGoogleMaps${Date.now()}`;
      googleMapsLoadState.callbackName = callbackName;
      
      // Define the callback function that will be called when Google Maps loads
      window[callbackName] = function() {
        console.log("Google Maps initialized");
        googleMapsLoadState.isLoaded = true;
        googleMapsLoadState.isLoading = false;
        
        // Check if maps object is actually available
        if (window.google?.maps) {
          resolve();
        } else {
          reject(new Error('Google Maps API loaded but maps object not available'));
        }
        
        // Cleanup the callback
        try {
          delete window[callbackName];
        } catch (e) {
          window[callbackName] = undefined;
        }
      };
      
      // Check for existing script tag
      const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      
      if (existingScript) {
        // If a script already exists but Google Maps isn't loaded yet, 
        // set a timeout to check if it loads within a reasonable time
        console.log("Found existing Google Maps script");
        
        setTimeout(() => {
          if (!googleMapsLoadState.isLoaded && googleMapsLoadState.isLoading) {
            console.log("Existing script didn't load Maps in time, creating new one");
            if (existingScript.parentNode) {
              existingScript.parentNode.removeChild(existingScript);
            }
            createNewScript();
          }
        }, 5000);
      } else {
        createNewScript();
      }
      
      function createNewScript() {
        // Create a new script element
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.async = true;
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=beta&callback=${callbackName}`;
        
        // Handle script loading errors
        script.onerror = (error) => {
          console.error("Error loading Google Maps script:", error);
          googleMapsLoadState.isLoading = false;
          googleMapsLoadState.isLoaded = false;
          
          // Cleanup
          if (window[callbackName]) {
            try {
              delete window[callbackName];
            } catch (e) {
              window[callbackName] = undefined;
            }
          }
          
          reject(new Error('Failed to load Google Maps API. Check your network connection and API key.'));
        };
        
        // Add the script to the document
        document.head.appendChild(script);
      }
    } catch (error) {
      googleMapsLoadState.isLoading = false;
      googleMapsLoadState.loadPromise = null;
      reject(error);
    }
  });
  
  return googleMapsLoadState.loadPromise;
};

/**
 * Safely gets the user's current location with improved error handling
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
 * Safely cleans up Google Maps script references
 */
export const cleanupGoogleMapsScript = (): void => {
  // Clear callback if it exists
  if (googleMapsLoadState.callbackName && window[googleMapsLoadState.callbackName]) {
    try {
      delete window[googleMapsLoadState.callbackName];
    } catch (e) {
      window[googleMapsLoadState.callbackName] = undefined;
    }
  }
  
  // Reset load state
  googleMapsLoadState.isLoaded = false;
  googleMapsLoadState.isLoading = false;
  googleMapsLoadState.loadPromise = null;
  
  console.log("Google Maps script references cleaned up");
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
