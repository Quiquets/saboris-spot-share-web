
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface VibeFilterProps {
  activeVibes: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const VibeFilter: React.FC<VibeFilterProps> = ({ 
  activeVibes, 
  handleFilterChange 
}) => {
  // Function to remove a vibe filter
  const removeVibe = (vibeId: string) => {
    const newFilters = activeVibes.filter(id => id !== vibeId);
    handleFilterChange('vibe', newFilters);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full gap-1 px-1 py-1 text-xs sm:text-sm sm:px-2 border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          <span className="truncate">Vibe</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="mb-2">
          {activeVibes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {activeVibes.map(vibeId => {
                const vibe = filterOptions.vibe.find(v => v.id === vibeId);
                return (
                  <div 
                    key={vibeId} 
                    className="flex items-center bg-saboris-primary text-white rounded-full px-2 py-1 text-xs"
                  >
                    <span>{vibe?.label}</span>
                    <button 
                      onClick={() => removeVibe(vibeId)}
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
        
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {filterOptions.vibe.map(option => (
            <Button 
              key={option.id}
              variant={activeVibes.includes(option.id) ? "default" : "outline"}
              className={`justify-start text-xs px-2 py-1 ${activeVibes.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => {
                const newFilters = activeVibes.includes(option.id)
                  ? activeVibes.filter(id => id !== option.id)
                  : [...activeVibes, option.id];
                handleFilterChange('vibe', newFilters);
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

export default VibeFilter;
