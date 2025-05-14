
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
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/lib/colors';

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
  const { setShowAuthModal } = useAuth();

  const handleFilterClick = (value: string) => {
    // If trying to access a protected filter and not authenticated, show auth modal
    if (!isUserAuthenticated && (value === 'friends' || value === 'friends-of-friends' || value === 'my-places')) {
      setShowAuthModal(true);
      return;
    }
    
    // Otherwise handle filter change normally
    handlePeopleFilterChange(value);
  };
  
  return (
    <div className="w-full">
      <ToggleGroup 
        type="single" 
        value={activePeople} 
        onValueChange={(val) => val && handleFilterClick(val)}
        className="w-full flex justify-between"
      >
        {filterOptions.people.map(option => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            aria-label={option.label}
            className={`text-xs h-8 flex-1 ${option.id === activePeople ? 'bg-saboris-primary text-white' : 'border-saboris-primary text-saboris-gray'}`}
          >
            {option.shortLabel}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default PeopleFilter;
