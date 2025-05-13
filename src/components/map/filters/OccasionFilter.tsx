
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface OccasionFilterProps {
  activeOccasions: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const OccasionFilter: React.FC<OccasionFilterProps> = ({ 
  activeOccasions, 
  handleFilterChange 
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full h-8 gap-1 px-2 text-xs border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Occasion</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto">
          {filterOptions.occasion.map(option => (
            <Button 
              key={option.id}
              variant={activeOccasions.includes(option.id) ? "default" : "outline"}
              className={`text-xs px-2 py-1 ${activeOccasions.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => {
                const newFilters = activeOccasions.includes(option.id)
                  ? activeOccasions.filter(id => id !== option.id)
                  : [...activeOccasions, option.id];
                handleFilterChange('occasion', newFilters);
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

export default OccasionFilter;
