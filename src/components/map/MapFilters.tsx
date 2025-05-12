
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
}

const MapFilters: React.FC<MapFiltersProps> = ({ 
  activeFilters, 
  handleFilterChange, 
  handlePeopleFilterChange, 
  toggleSortDirection 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-start w-full">
      {/* People filter tabs */}
      <PeopleFilter 
        activePeople={activeFilters.people}
        handlePeopleFilterChange={handlePeopleFilterChange}
      />

      {/* Filter grid - responsive for mobile */}
      <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-5 gap-2'} w-full mb-4`}>
        {/* Filter buttons remain the same */}
        <OccasionFilter 
          activeOccasions={activeFilters.occasion}
          handleFilterChange={handleFilterChange}
        />
        
        <FoodTypeFilter 
          activeFoodTypes={activeFilters.foodType}
          handleFilterChange={handleFilterChange}
          singleSelect={true} // Set to single select mode
        />

        <VibeFilter 
          activeVibes={activeFilters.vibe}
          handleFilterChange={handleFilterChange}
        />

        <PriceFilter 
          activePrices={activeFilters.price}
          handleFilterChange={handleFilterChange}
        />

        <RatingFilters 
          activeFilters={activeFilters}
          toggleSortDirection={toggleSortDirection}
        />
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
