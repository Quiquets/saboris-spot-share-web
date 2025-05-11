
export interface SharedPlace {
  id: string;
  place_id: string;
  created_at: Date;
  place: {
    name: string;
    description?: string;
    tags?: string[];
    category?: string;
    address?: string;
    image_url?: string;
  };
  rating?: number;
  review_text?: string;
}
