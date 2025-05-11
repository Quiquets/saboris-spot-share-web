
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    [key: string]: any; // For dynamic callback names
  }
}

export {};
