
import React from 'react';
import { ActiveFilters, FilterChangeHandler, PeopleFilterChangeHandler } from './FilterOptions';
import PeopleFilter from './filters/PeopleFilter';
import OccasionFilter from './filters/OccasionFilter';
import FoodTypeFilter from './filters/FoodTypeFilter';
import VibeFilter from './filters/VibeFilter';
import PriceFilter from './filters/PriceFilter';
import RatingFilters from './filters/RatingFilters';
import ActiveFilterBadges from './filters/ActiveFilterBadges';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapFiltersProps {
  activeFilters: ActiveFilters;
  handleFilterChange: FilterChangeHandler;
  handlePeopleFilterChange: PeopleFilterChangeHandler;
  toggleSortDirection: (category: string) => void;
  isUserAuthenticated?: boolean;
}

const MapFilters: React.FC<MapFiltersProps> = ({ 
  activeFilters, 
  handleFilterChange, 
  handlePeopleFilterChange, 
  toggleSortDirection,
  isUserAuthenticated = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-start w-full">
      {/* People filter tabs - improved for mobile */}
      <PeopleFilter 
        activePeople={activeFilters.people}
        handlePeopleFilterChange={handlePeopleFilterChange}
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
      
      {/* Active filter badges */}
      <ActiveFilterBadges 
        activeOccasions={activeFilters.occasion}
        activeFoodTypes={activeFilters.foodType}
        activeVibes={activeFilters.vibe}
        activePrices={activeFilters.price}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default MapFilters;
