
export interface SharedPlace {
  id: string; // Can be place_id or review_id
  place_id: string; // Always the ID of the place itself
  created_at: Date;
  created_by?: string;
  place: {
    name: string;
    description?: string;
    tags?: string[];
    category?: string;
    address?: string;
    image_url?: string; // Main image for the place from 'places' table
  };
  rating?: number; // Average rating for reviews
  review_text?: string;
  photo_urls?: string[]; // Photos specifically for a review from 'reviews' table, or for a place from 'places' table (if we add it there)
  type?: 'place' | 'review'; // To distinguish item type in combined lists
}
