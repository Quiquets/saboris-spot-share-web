
import React from 'react';
import { Loader2 } from 'lucide-react';
import RestaurantCard from './RestaurantCard';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  place_id: string;
  cuisine?: string;
  avg_rating?: number;
  reviewers?: {
    id: string;
    name: string;
    avatar_url: string | null;
  }[];
  is_saved?: boolean;
}

interface RestaurantSearchResultsProps {
  loading: boolean;
  searchQuery: string;
  restaurants: Restaurant[];
  saveLoading: Record<string, boolean>;
  onSave: (restaurantId: string) => void;
  onUnsave: (restaurantId: string) => void;
}

const RestaurantSearchResults: React.FC<RestaurantSearchResultsProps> = ({
  loading,
  searchQuery,
  restaurants,
  saveLoading,
  onSave,
  onUnsave
}) => {
  if (restaurants.length > 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              saveLoading={saveLoading[restaurant.id] || false}
              onSave={() => onSave(restaurant.id)}
              onUnsave={() => onUnsave(restaurant.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (loading && searchQuery) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-saboris-primary" />
      </div>
    );
  }

  if (searchQuery && !loading && restaurants.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">No restaurants found matching "{searchQuery}"</p>
      </div>
    );
  }

  return null;
};

export default RestaurantSearchResults;
