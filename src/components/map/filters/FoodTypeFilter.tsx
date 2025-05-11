import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface FoodTypeFilterProps {
  activeFoodTypes: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const FoodTypeFilter: React.FC<FoodTypeFilterProps> = ({ 
  activeFoodTypes, 
  handleFilterChange 
}) => {
  // Handle single select for cuisine
  const handleCuisineSelect = (id: string) => {
    // If the id is already selected, deselect it (empty array)
    // Otherwise, select only this cuisine (replace array with single item)
    const newFilters = activeFoodTypes.includes(id) ? [] : [id];
    handleFilterChange('foodType', newFilters);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          Cuisine
          {activeFoodTypes.length > 0 && (
            <span className="ml-1 bg-saboris-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeFoodTypes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {filterOptions.foodType.map(option => (
            <Button 
              key={option.id}
              variant={activeFoodTypes.includes(option.id) ? "default" : "outline"}
              className={`justify-start text-xs px-2 py-1 ${activeFoodTypes.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => handleCuisineSelect(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FoodTypeFilter;
