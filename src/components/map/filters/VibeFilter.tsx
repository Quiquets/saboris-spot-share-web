
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
  // Function to remove a vibe from selection
  const removeVibe = (idToRemove: string, e?: React.MouseEvent) => {
    // Stop propagation if this is called from a button click
    if (e) {
      e.stopPropagation();
    }
    
    const newFilters = activeVibes.filter(id => id !== idToRemove);
    handleFilterChange('vibe', newFilters);
  };
  
  // Function to add a vibe to selection
  const addVibe = (id: string) => {
    // If already selected, remove it, otherwise add it
    if (activeVibes && activeVibes.includes(id)) {
      removeVibe(id);
    } else {
      const newFilters = [...(activeVibes || []), id];
      handleFilterChange('vibe', newFilters);
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
          <Filter className="h-3 w-3 text-saboris-primary" /> 
          Vibe
          {activeVibes && activeVibes.length > 0 && (
            <span className="ml-1 bg-saboris-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeVibes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {filterOptions.vibe.map(option => (
            <Button 
              key={option.id}
              variant={activeVibes && activeVibes.includes(option.id) ? "default" : "outline"}
              className={`justify-start text-xs px-2 py-1 ${activeVibes && activeVibes.includes(option.id) 
                ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                : "border-saboris-primary text-saboris-gray"}`}
              onClick={() => addVibe(option.id)}
            >
              <span className="flex-1 text-left">{option.label}</span>
              {activeVibes && activeVibes.includes(option.id) && (
                <X 
                  className="h-3 w-3 ml-1 hover:text-saboris-light" 
                  onClick={(e) => removeVibe(option.id, e)}
                />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VibeFilter;
