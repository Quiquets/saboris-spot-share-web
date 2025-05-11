
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface OccasionFilterProps {
  activeOccasions: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const OccasionFilter: React.FC<OccasionFilterProps> = ({ 
  activeOccasions, 
  handleFilterChange 
}) => {
  // Function to remove an occasion from selection
  const removeOccasion = (idToRemove: string, e?: React.MouseEvent) => {
    // Stop propagation if this is called from a button click
    if (e) {
      e.stopPropagation();
    }
    
    const newFilters = activeOccasions ? activeOccasions.filter(id => id !== idToRemove) : [];
    handleFilterChange('occasion', newFilters);
  };
  
  // Function to add an occasion to selection
  const addOccasion = (id: string) => {
    // If already selected, remove it, otherwise add it
    if (activeOccasions && activeOccasions.includes(id)) {
      removeOccasion(id);
    } else {
      const newFilters = [...(activeOccasions || []), id];
      handleFilterChange('occasion', newFilters);
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          Occasion
          {activeOccasions && activeOccasions.length > 0 && (
            <span className="ml-1 bg-saboris-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeOccasions.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
          {filterOptions.occasion.map(option => (
            <Button 
              key={option.id}
              variant={activeOccasions && activeOccasions.includes(option.id) ? "default" : "outline"}
              className={`text-xs px-2 py-1 flex items-center ${activeOccasions && activeOccasions.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => addOccasion(option.id)}
            >
              <span>{option.label}</span>
              {activeOccasions && activeOccasions.includes(option.id) && (
                <X 
                  className="h-3 w-3 ml-1 hover:text-saboris-light" 
                  onClick={(e) => removeOccasion(option.id, e)}
                />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OccasionFilter;
