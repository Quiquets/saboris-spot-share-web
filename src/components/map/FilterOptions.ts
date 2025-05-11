
// Constants for map filter options
export const filterOptions = {
  people: [
    { id: 'community', label: 'Saboris Community' },
    { id: 'friends', label: 'Friends' },
    { id: 'friends-of-friends', label: 'Friends of Friends' },
  ],
  occasion: [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'brunch', label: 'Brunch' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
  ],
  foodType: [
    { id: 'sushi', label: 'Sushi 🍣' },
    { id: 'indian', label: 'Indian 🥘' },
    { id: 'italian', label: 'Italian 🍝' },
    { id: 'burgers', label: 'Burgers 🍔' },
    { id: 'coffee', label: 'Coffee ☕' },
    { id: 'street-food', label: 'Street Food 🌮' },
    { id: 'healthy', label: 'Healthy 🥗' },
    { id: 'dessert', label: 'Dessert 🍰' },
    { id: 'mexican', label: 'Mexican 🌮' },
    { id: 'thai', label: 'Thai 🍜' },
    { id: 'chinese', label: 'Chinese 🥡' },
    { id: 'breakfast', label: 'Breakfast 🥞' },
    { id: 'seafood', label: 'Seafood 🦞' },
    { id: 'pizza', label: 'Pizza 🍕' },
    { id: 'bbq', label: 'BBQ 🍖' },
    { id: 'vegan', label: 'Vegan 🥬' },
    { id: 'vegetarian', label: 'Vegetarian 🥕' },
    { id: 'mediterranean', label: 'Mediterranean 🫒' },
    { id: 'greek', label: 'Greek 🥙' },
    { id: 'french', label: 'French 🥐' },
    { id: 'korean', label: 'Korean 🍲' },
    { id: 'japanese', label: 'Japanese 🍱' },
    { id: 'vietnamese', label: 'Vietnamese 🍜' },
    { id: 'tapas', label: 'Tapas 🧆' },
  ],
  vibe: [
    { id: 'romantic', label: 'Romantic' },
    { id: 'casual', label: 'Casual' },
    { id: 'lively', label: 'Lively' },
    { id: 'business', label: 'Business' },
    { id: 'solo-friendly', label: 'Solo Friendly' },
    { id: 'family-friendly', label: 'Family Friendly' },
    { id: 'outdoor', label: 'Outdoor Seating' },
    { id: 'local', label: 'Local Favorite' },
    { id: 'trendy', label: 'Trendy' },
    { id: 'cozy', label: 'Cozy' },
    { id: 'quiet', label: 'Quiet' },
    { id: 'live-music', label: 'Live Music' },
    { id: 'pet-friendly', label: 'Pet Friendly' },
    { id: 'instagrammable', label: 'Instagrammable' },
    { id: 'view', label: 'Great View' },
    { id: 'historic', label: 'Historic' },
    { id: 'hidden-gem', label: 'Hidden Gem' },
    { id: 'rooftop', label: 'Rooftop' },
    { id: 'speakeasy', label: 'Speakeasy' },
    { id: 'sports-bar', label: 'Sports Bar' },
    { id: 'late-night', label: 'Late Night' },
    { id: 'brunch', label: 'Brunch' },
    { id: 'work-friendly', label: 'Work Friendly' },
    { id: 'date-night', label: 'Date Night' },
  ],
  price: [
    { id: 'low', label: '€' },
    { id: 'medium', label: '€€' },
    { id: 'high', label: '€€€' },
    { id: 'premium', label: '€€€€' },
  ],
  additional: [
    { id: 'value', label: 'Value for Money' },
    { id: 'food-quality', label: 'Food Quality' },
    { id: 'service', label: 'Service' },
    { id: 'atmosphere', label: 'Atmosphere' },
  ],
};

// Define types for the filters
export interface ActiveFilters {
  people: string;
  occasion: string[];
  foodType: string[];
  vibe: string[];
  price: string[];
  rating: number;
  foodSortDirection: "asc" | "desc";
  serviceSortDirection: "asc" | "desc";
  atmosphereSortDirection: "asc" | "desc";
  valueSortDirection: "asc" | "desc";
}

export type FilterChangeHandler = (type: string, value: string | string[] | { direction: "asc" | "desc", category: string }) => void;
export type PeopleFilterChangeHandler = (value: string) => void;
