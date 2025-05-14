import React from 'react';
import { ActiveFilters } from '@/components/map/FilterOptions';
import PeopleFilter from '@/components/map/filters/PeopleFilter';
import OccasionFilter from '@/components/map/filters/OccasionFilter';
import FoodTypeFilter from '@/components/map/filters/FoodTypeFilter';
import VibeFilter from '@/components/map/filters/VibeFilter';
import PriceFilter from '@/components/map/filters/PriceFilter';
import RatingFilters from '@/components/map/filters/RatingFilters';

interface SavedPlacesFiltersProps {
  activeFilters: ActiveFilters;
  handleFilterChange: (type: string, value: any) => void;
  handlePeopleFilterChange: (value: string) => void;
  toggleSortDirection: (category: string) => void;
  isUserAuthenticated: boolean;
}

export const SavedPlacesFilters: React.FC<SavedPlacesFiltersProps> = ({
  activeFilters,
  handleFilterChange,
  handlePeopleFilterChange,
  toggleSortDirection,
  isUserAuthenticated,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 w-full mb-4 md:mb-6">
      {/* People filter positioned above other filters */}
      <div className="mb-3">
        <PeopleFilter
          activePeople={activeFilters.people} 
          handlePeopleFilterChange={handlePeopleFilterChange}
          isUserAuthenticated={isUserAuthenticated}
        />
      </div>
      
      {/* Other filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
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
            rating={activeFilters.rating.toString()}
            sortDirection={activeFilters.sortDirection || "desc"}
            toggleSortDirection={toggleSortDirection}
          />
        </div>
      </div>
    </div>
  );
};
