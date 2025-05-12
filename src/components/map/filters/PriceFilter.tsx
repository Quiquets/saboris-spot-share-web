
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface PriceFilterProps {
  activePrices: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ 
  activePrices, 
  handleFilterChange 
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full gap-1 px-1 py-1 text-xs sm:text-sm sm:px-2 border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          <span className="truncate">Price</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="flex flex-wrap gap-2">
          {filterOptions.price.map(option => (
            <Button 
              key={option.id}
              variant={activePrices.includes(option.id) ? "default" : "outline"}
              className={`text-xs px-2 py-1 ${activePrices.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => {
                const newFilters = activePrices.includes(option.id)
                  ? activePrices.filter(id => id !== option.id)
                  : [...activePrices, option.id];
                handleFilterChange('price', newFilters);
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

export default PriceFilter;
