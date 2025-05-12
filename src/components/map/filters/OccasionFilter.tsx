
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
  // Function to remove an occasion filter
  const removeOccasion = (occasionId: string) => {
    const newFilters = activeOccasions.filter(id => id !== occasionId);
    handleFilterChange('occasion', newFilters);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full gap-1 px-1 py-1 text-xs sm:text-sm sm:px-2 border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          <span className="truncate">Occasion</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="mb-2">
          {activeOccasions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {activeOccasions.map(occasionId => {
                const occasion = filterOptions.occasion.find(o => o.id === occasionId);
                return (
                  <div 
                    key={occasionId} 
                    className="flex items-center bg-saboris-primary text-white rounded-full px-2 py-1 text-xs"
                  >
                    <span>{occasion?.label}</span>
                    <button 
                      onClick={() => removeOccasion(occasionId)}
                      className="ml-1 p-0.5 rounded-full hover:bg-saboris-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      
        <div className="flex flex-wrap gap-2">
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
