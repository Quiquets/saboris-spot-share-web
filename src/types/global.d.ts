declare global {
  interface Window {
    google: any;
    initMap: () => void;
    [key: string]: any; // For dynamic callback names like initGoogleMap12345
  }
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  avatar_url?: string | null;
  bio?: string;
  location?: string;
  is_private?: boolean;
}
