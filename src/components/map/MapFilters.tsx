import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ActiveFilterBadges from './ActiveFilterBadges';
import OccasionFilter from './OccasionFilter';
import FoodTypeFilter from './FoodTypeFilter';
import VibeFilter from './VibeFilter';
import PriceFilter from './PriceFilter';
import RatingFilters from './RatingFilters';

interface FilterProps {
  activeFilters: {
    occasion: string[];
    foodType: string[];
    vibe: string[];
    price: string[];
    rating: string;
    sortDirection: 'asc' | 'desc';
  };
  handleFilterChange: (filterType: string, filterValue: string) => void;
  toggleSortDirection: () => void;
  isUserAuthenticated: boolean;
}

const MapFilters: React.FC<FilterProps> = ({
  activeFilters,
  handleFilterChange,
  toggleSortDirection,
  isUserAuthenticated,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 w-full">
      <ActiveFilterBadges
        activeFilters={activeFilters}
        handleFilterChange={handleFilterChange}
        isUserAuthenticated={isUserAuthenticated}
      />

      {/* Filter grid - responsive for mobile */}
      <div className="grid grid-cols-5 gap-2 w-full mb-3 md:mb-4">
        <div>
          <OccasionFilter 
            activeOccasions={activeFilters.occasion}
            handleFilterChange={handleFilterChange}
          />
        </div>
        
        <div>
          <FoodTypeFilter 
            activeFoodTypes={activeFilters.foodType}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div>
          <VibeFilter 
            activeVibes={activeFilters.vibe}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div>
          <PriceFilter 
            activePrices={activeFilters.price}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div>
          <RatingFilters 
            activeFilters={activeFilters}
            toggleSortDirection={toggleSortDirection}
          />
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
