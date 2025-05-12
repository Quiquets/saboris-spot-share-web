
import { z } from 'zod';

// Form schema with Zod validation
export const formSchema = z.object({
  place_name: z.string().min(1, "Place name is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number(),
  lng: z.number(),
  place_id: z.string(),
  place_type: z.enum(["restaurant", "bar", "cafe"]),
  rating_food: z.number().min(1, "Food rating is required"),
  rating_service: z.number().min(1, "Service rating is required"),
  rating_atmosphere: z.number().min(1, "Atmosphere rating is required"),
  rating_value: z.number().min(1, "Value rating is required"),
  cuisine: z.string().optional(),
  price_range: z.string().min(1, "Price range is required"),
  occasions: z.array(z.string()).optional(),
  vibes: z.array(z.string()).optional(),
  description: z.string().optional(),
  ordered_items: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
  tagged_friends: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
});

export type FormValues = z.infer<typeof formSchema>;

export interface PlaceDetails {
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  photos?: string[];
}
