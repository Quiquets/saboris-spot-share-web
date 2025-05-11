
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    [key: string]: any; // Add this to allow dynamic property assignment
  }
}

export {};
