
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

// Function to load Google Maps script
let scriptLoadPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  // If we already have a promise in flight, return that instead of creating a new script
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // Check if the API is already loaded
    if (window.google && window.google.maps) {
      console.log("Google Maps API already loaded");
      resolve();
      return;
    }
    
    // Define global callback before creating script
    window.initMap = () => {
      console.log("Google Maps initialized");
      resolve();
    };
    
    // Create script element
    const googleMapsScript = document.createElement('script');
    googleMapsScript.id = 'google-maps-script';
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuq7aCWMYJQwiSJxN7u-DRX-2xHAeVQeo&libraries=places&v=beta&callback=initMap`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    googleMapsScript.onerror = (e) => {
      console.error('Google Maps failed to load:', e);
      reject(new Error('Google Maps failed to load. Check API key or network connection.'));
    };
    
    document.body.appendChild(googleMapsScript);
  });
  
  return scriptLoadPromise;
};

// Clean up script and global references - IMPORTANT for preventing React DOM errors
export const cleanupGoogleMapsScript = (): void => {
  // Clear global callback
  if (window.initMap) {
    // Use a no-op function instead of deleting to prevent errors
    window.initMap = () => {};
  }
  
  // Reset our promise reference
  scriptLoadPromise = null;
};

// Get user's current location
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
