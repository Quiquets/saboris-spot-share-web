
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" 
          className="w-full h-8 gap-1 px-2 text-xs border-saboris-primary text-saboris-gray">
          <Users className="h-3 w-3 text-saboris-primary" /> 
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">People</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="flex flex-col space-y-1.5">
          <p className="text-xs font-medium text-gray-500 mb-1">Show places from:</p>
          <ToggleGroup type="single" value={activePeople} onValueChange={(val) => val && handlePeopleFilterChange(val)}>
            {filterOptions.people.map(option => (
              <ToggleGroupItem
                key={option.id}
                value={option.id}
                aria-label={option.label}
                disabled={!isUserAuthenticated && option.id !== 'community'}
                className={`flex-1 text-xs h-8 ${option.id === activePeople ? 'bg-saboris-primary text-white' : 'border-saboris-primary text-saboris-gray'}`}
              >
                {option.shortLabel}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {!isUserAuthenticated && (
            <p className="text-xs text-gray-500 mt-1">Sign in to see places from friends</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PeopleFilter;
