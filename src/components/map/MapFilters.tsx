
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { filterOptions, ActiveFilters } from './FilterOptions';
import ActiveFilterBadges from './filters/ActiveFilterBadges';
import OccasionFilter from './filters/OccasionFilter';
import FoodTypeFilter from './filters/FoodTypeFilter';
import VibeFilter from './filters/VibeFilter';
import PriceFilter from './filters/PriceFilter';
import RatingFilters from './filters/RatingFilters';

interface FilterProps {
  activeFilters: {
    occasion: string[];
    foodType: string[];
    vibe: string[];
    price: string[];
    rating: string;
    sortDirection: 'asc' | 'desc';
  };
  handleFilterChange: (filterType: string, filterValue: string[]) => void;
  handlePeopleFilterChange: (value: string) => void;
  toggleSortDirection: (category: string) => void;
  isUserAuthenticated: boolean;
}

const MapFilters: React.FC<FilterProps> = ({
  activeFilters,
  handleFilterChange,
  handlePeopleFilterChange,
  toggleSortDirection,
  isUserAuthenticated,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 w-full">
      <ActiveFilterBadges
        activeOccasions={activeFilters.occasion}
        activeFoodTypes={activeFilters.foodType}
        activeVibes={activeFilters.vibe}
        activePrices={activeFilters.price}
        handleFilterChange={handleFilterChange}
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
            rating={activeFilters.rating}
            sortDirection={activeFilters.sortDirection}
            toggleSortDirection={toggleSortDirection}
          />
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
