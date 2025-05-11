
import React from 'react';
import { ActiveFilters, FilterChangeHandler, PeopleFilterChangeHandler } from './FilterOptions';
import PeopleFilter from './filters/PeopleFilter';
import OccasionFilter from './filters/OccasionFilter';
import FoodTypeFilter from './filters/FoodTypeFilter';
import VibeFilter from './filters/VibeFilter';
import PriceFilter from './filters/PriceFilter';
import RatingFilters from './filters/RatingFilters';
import ActiveFilterBadges from './filters/ActiveFilterBadges';

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
  return (
    <div className="flex flex-col items-start w-full">
      {/* People filter tabs */}
      <PeopleFilter 
        activePeople={activeFilters.people || 'community'}
        handlePeopleFilterChange={handlePeopleFilterChange}
      />

      {/* Horizontal filter bar with evenly distributed filters */}
      <div className="grid grid-cols-5 w-full mb-4 gap-2">
        {/* Occasion Filter */}
        <OccasionFilter 
          activeOccasions={activeFilters.occasion || []}
          handleFilterChange={handleFilterChange}
        />
        
        {/* Food Type Filter */}
        <FoodTypeFilter 
          activeFoodTypes={activeFilters.foodType || []}
          handleFilterChange={handleFilterChange}
        />

        {/* Vibe Filter */}
        <VibeFilter 
          activeVibes={activeFilters.vibe || []}
          handleFilterChange={handleFilterChange}
        />

        {/* Price Filter */}
        <PriceFilter 
          activePrices={activeFilters.price || []}
          handleFilterChange={handleFilterChange}
        />

        {/* More Filters */}
        <RatingFilters 
          activeFilters={activeFilters}
          toggleSortDirection={toggleSortDirection}
        />
      </div>
      
      {/* Active filter badges */}
      <ActiveFilterBadges 
        activeOccasions={activeFilters.occasion || []}
        activeFoodTypes={activeFilters.foodType || []}
        activeVibes={activeFilters.vibe || []}
        activePrices={activeFilters.price || []}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default MapFilters;
