
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
let scriptLoadPromise: Promise<void> | null = null;
let scriptElement: HTMLScriptElement | null = null;

/**
 * Loads the Google Maps API script safely
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  // If promise exists, return it
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  
  // Check if Google Maps is already loaded
  if (window.google && window.google.maps) {
    console.log("Google Maps API already loaded");
    return Promise.resolve();
  }
  
  // Check if script element already exists but remove it first to avoid issues
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    try {
      existingScript.parentNode?.removeChild(existingScript);
    } catch (e) {
      console.warn("Failed to remove existing script:", e);
    }
  }
  
  // Create a new promise for script loading
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Create unique callback name to avoid conflicts
      const callbackName = `initGoogleMap${Date.now()}`;
      
      // Define callback function
      window[callbackName] = () => {
        console.log("Google Maps initialized");
        resolve();
        // Clean up callback
        delete window[callbackName];
      };
      
      // Create script element
      scriptElement = document.createElement('script');
      scriptElement.id = SCRIPT_ID;
      scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuq7aCWMYJQwiSJxN7u-DRX-2xHAeVQeo&libraries=places&v=beta&callback=${callbackName}`;
      scriptElement.async = true;
      scriptElement.defer = true;
      
      scriptElement.onerror = (e) => {
        console.error('Google Maps failed to load:', e);
        reject(new Error('Google Maps failed to load. Check API key or network connection.'));
        cleanupGoogleMapsScript();
      };
      
      // Append to document head for better practice
      document.head.appendChild(scriptElement);
    } catch (error) {
      reject(error);
      scriptLoadPromise = null;
      scriptElement = null;
    }
  });
  
  return scriptLoadPromise;
};

/**
 * Safely cleans up Google Maps script
 */
export const cleanupGoogleMapsScript = (): void => {
  // Reset load promise
  scriptLoadPromise = null;
  
  // Only attempt to remove if we have a reference to the script we added
  if (scriptElement && scriptElement.parentNode) {
    try {
      scriptElement.parentNode.removeChild(scriptElement);
      scriptElement = null;
    } catch (error) {
      console.warn("Error removing Google Maps script:", error);
    }
  }
  
  // Find and remove script if it exists by ID as a fallback
  const scriptById = document.getElementById(SCRIPT_ID);
  if (scriptById && scriptById.parentNode) {
    try {
      scriptById.parentNode.removeChild(scriptById);
    } catch (error) {
      console.warn("Error removing Google Maps script by ID:", error);
    }
  }
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
