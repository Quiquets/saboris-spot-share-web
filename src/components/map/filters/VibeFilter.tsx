
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Plus } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface VibeFilterProps {
  activeVibes: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const VibeFilter: React.FC<VibeFilterProps> = ({ activeVibes = [], handleFilterChange }) => {
  // Function to remove vibe from selection
  const removeVibe = (idToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newFilters = activeVibes ? activeVibes.filter(id => id !== idToRemove) : [];
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
        <Button variant="outline" className="relative justify-start w-full">
          <div className="flex items-center justify-between w-full">
            <span>Vibe</span>
            {activeVibes && activeVibes.length > 0 && (
              <span className="ml-1 rounded-full bg-saboris-primary text-white w-5 h-5 flex items-center justify-center text-xs">
                {activeVibes.length}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid grid-cols-1 gap-1">
          {filterOptions.vibe.map(option => (
            <Button
              key={option.id}
              variant="ghost"
              className="justify-start px-2 h-8"
              onClick={() => addVibe(option.id)}
            >
              <span className="w-4 h-4 mr-2 flex items-center justify-center">
                {activeVibes && activeVibes.includes(option.id) ? (
                  <Check className="h-4 w-4 text-saboris-primary" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </span>
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VibeFilter;
