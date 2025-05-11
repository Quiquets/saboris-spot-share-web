
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    [key: string]: any; // For dynamic callback names like initGoogleMap12345
  }
}

export {};
