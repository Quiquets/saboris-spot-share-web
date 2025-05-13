
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

      {/* Filter grid - responsive for mobile with better sizing */}
      <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-5 gap-2'} w-full mb-3 md:mb-4`}>
        <div className={`${isMobile ? 'col-span-1' : ''}`}>
          <OccasionFilter 
            activeOccasions={activeFilters.occasion}
            handleFilterChange={handleFilterChange}
          />
        </div>
        
        <div className={`${isMobile ? 'col-span-1' : ''}`}>
          <FoodTypeFilter 
            activeFoodTypes={activeFilters.foodType}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div className={`${isMobile ? 'col-span-1' : ''}`}>
          <VibeFilter 
            activeVibes={activeFilters.vibe}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div className={`${isMobile ? 'col-span-1' : ''}`}>
          <PriceFilter 
            activePrices={activeFilters.price}
            handleFilterChange={handleFilterChange}
          />
        </div>

        <div className={`${isMobile ? 'col-span-2 mt-2' : ''}`}>
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
