
import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users } from 'lucide-react';
import { filterOptions } from '../FilterOptions';

interface PeopleFilterProps {
  activePeople: string;
  handlePeopleFilterChange: (value: string) => void;
  isUserAuthenticated: boolean;
}

const PeopleFilter: React.FC<PeopleFilterProps> = ({ 
  activePeople,
  handlePeopleFilterChange,
  isUserAuthenticated
}) => {
  return (
    <div className="w-full">
      <ToggleGroup 
        type="single" 
        value={activePeople} 
        onValueChange={(val) => val && handlePeopleFilterChange(val)}
        className="w-full flex justify-between"
      >
        {filterOptions.people.map(option => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            aria-label={option.label}
            disabled={!isUserAuthenticated && option.id !== 'community'}
            className={`text-xs h-8 flex-1 ${option.id === activePeople ? 'bg-saboris-primary text-white' : 'border-saboris-primary text-saboris-gray'}`}
          >
            {option.shortLabel}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {!isUserAuthenticated && (
        <p className="text-xs text-gray-500 mt-1 text-center">Sign in to see places from friends</p>
      )}
    </div>
  );
};

export default PeopleFilter;
