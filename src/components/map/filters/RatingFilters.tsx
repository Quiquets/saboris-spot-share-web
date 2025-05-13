
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, ArrowUp, ArrowDown } from 'lucide-react';

interface RatingFiltersProps {
  rating: string; 
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: (category: string) => void;
}

const RatingFilters: React.FC<RatingFiltersProps> = ({ 
  rating,
  sortDirection,
  toggleSortDirection
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full h-8 gap-1 px-2 text-xs border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Rating</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Sort ratings by:</p>
          
          {/* Value for Money */}
          <Button 
            variant="outline"
            className="justify-between text-xs"
            onClick={() => toggleSortDirection('value')}
          >
            <span>Value for Money</span>
            {sortDirection === 'desc' ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
          </Button>
          
          {/* Food Quality */}
          <Button 
            variant="outline"
            className="justify-between text-xs"
            onClick={() => toggleSortDirection('food-quality')}
          >
            <span>Food Quality</span>
            {sortDirection === 'desc' ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
          </Button>
          
          {/* Service */}
          <Button 
            variant="outline"
            className="justify-between text-xs"
            onClick={() => toggleSortDirection('service')}
          >
            <span>Service</span>
            {sortDirection === 'desc' ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
          </Button>
          
          {/* Atmosphere */}
          <Button 
            variant="outline"
            className="justify-between text-xs"
            onClick={() => toggleSortDirection('atmosphere')}
          >
            <span>Atmosphere</span>
            {sortDirection === 'desc' ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RatingFilters;
