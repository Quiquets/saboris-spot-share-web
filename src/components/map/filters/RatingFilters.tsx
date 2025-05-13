
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sliders, ArrowDown, ArrowUp } from 'lucide-react';
import { filterOptions } from '../FilterOptions';
import { ActiveFilters } from '../FilterOptions';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the mapping between option.id and state property keys
const directionKeyMap: Record<string, keyof ActiveFilters> = {
  'value': 'valueSortDirection',
  'food-quality': 'foodSortDirection',
  'service': 'serviceSortDirection',
  'atmosphere': 'atmosphereSortDirection'
};

interface RatingFiltersProps {
  activeFilters: ActiveFilters;
  toggleSortDirection: (category: string) => void;
}

const RatingFilters: React.FC<RatingFiltersProps> = ({ 
  activeFilters, 
  toggleSortDirection 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full h-8 gap-1 px-2 text-xs border-saboris-primary text-saboris-gray">
          <Sliders className="h-3 w-3 text-saboris-primary" /> 
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Rating</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-medium mb-2 text-saboris-gray">Rating Criteria</h3>
            <div className="grid grid-cols-1 gap-2">
              {filterOptions.additional.map(option => {
                // Get the corresponding direction key from the mapping
                const directionKey = directionKeyMap[option.id];
                const currentDirection = activeFilters[directionKey] as "asc" | "desc";
                
                return (
                  <Button 
                    key={option.id}
                    variant="outline"
                    className="justify-between text-xs px-2 py-1 w-full border-saboris-primary text-saboris-gray"
                    onClick={() => toggleSortDirection(option.id)}
                  >
                    {option.label}
                    {currentDirection === "desc" ? 
                      <ArrowDown className="h-3 w-3" /> : 
                      <ArrowUp className="h-3 w-3" />
                    }
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RatingFilters;
