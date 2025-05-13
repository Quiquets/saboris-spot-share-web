
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full h-8 gap-1 px-2 text-xs border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Food</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
          {filterOptions.foodType.map(option => (
            <Button 
              key={option.id}
              variant={activeFoodTypes.includes(option.id) ? "default" : "outline"}
              className={`justify-start text-xs px-2 py-1 ${activeFoodTypes.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => {
                const newFilters = activeFoodTypes.includes(option.id)
                  ? activeFoodTypes.filter(id => id !== option.id)
                  : [...activeFoodTypes, option.id];
                handleFilterChange('foodType', newFilters);
              }}
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
