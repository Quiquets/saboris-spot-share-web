
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

// Improved script loading - track script element directly
let googleMapScriptElement: HTMLScriptElement | null = null;
let scriptLoadPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  // If we already have a promise in flight, return that
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  
  // If the API is already loaded, resolve immediately
  if (window.google && window.google.maps) {
    console.log("Google Maps API already loaded");
    return Promise.resolve();
  }
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // Create a unique callback name to avoid conflicts
    const callbackName = `initGoogleMap${Date.now()}`;
    
    // Define the callback function
    window[callbackName] = () => {
      console.log("Google Maps initialized");
      resolve();
      // Clean up the global callback
      delete window[callbackName];
    };
    
    // Create script element
    googleMapScriptElement = document.createElement('script');
    googleMapScriptElement.id = 'google-maps-script';
    googleMapScriptElement.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuq7aCWMYJQwiSJxN7u-DRX-2xHAeVQeo&libraries=places&v=beta&callback=${callbackName}`;
    googleMapScriptElement.async = true;
    googleMapScriptElement.defer = true;
    
    googleMapScriptElement.onerror = (e) => {
      console.error('Google Maps failed to load:', e);
      reject(new Error('Google Maps failed to load. Check API key or network connection.'));
      cleanupGoogleMapsScript();
    };
    
    document.body.appendChild(googleMapScriptElement);
  });
  
  return scriptLoadPromise;
};

// Improved cleanup function that manages the script element directly
export const cleanupGoogleMapsScript = (): void => {
  // Only remove the script if we created it
  if (googleMapScriptElement && googleMapScriptElement.parentNode) {
    try {
      googleMapScriptElement.parentNode.removeChild(googleMapScriptElement);
    } catch (error) {
      console.warn("Error removing Google Maps script:", error);
    }
  }
  
  // Reset our references
  googleMapScriptElement = null;
  scriptLoadPromise = null;
  
  // Don't delete window.google as it can cause issues with React
  // Just clear our specific callbacks
  if (window.initMap) {
    window.initMap = () => {};
  }
};

// Get user's current location with improved error handling
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
