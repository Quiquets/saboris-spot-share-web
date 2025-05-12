
import React from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { filterOptions } from '../FilterOptions';
import { useIsMobile } from '@/hooks/use-mobile';

interface PeopleFilterProps {
  activePeople: string;
  handlePeopleFilterChange: (value: string) => void;
  isUserAuthenticated?: boolean;
}

const PeopleFilter: React.FC<PeopleFilterProps> = ({ 
  activePeople, 
  handlePeopleFilterChange,
  isUserAuthenticated = false
}) => {
  const isMobile = useIsMobile();
  
  // Filter options based on authentication
  const availableOptions = filterOptions.people.filter(option => {
    // Always show community option
    if (option.id === 'community') return true;
    // Only show friends/friends-of-friends if authenticated
    return isUserAuthenticated;
  });

  return (
    <Tabs 
      value={activePeople} 
      className="w-full mb-4"
      onValueChange={handlePeopleFilterChange}
    >
      <TabsList className="grid w-full mb-2 md:mb-4" style={{
        gridTemplateColumns: `repeat(${availableOptions.length}, minmax(0, 1fr))`
      }}>
        {availableOptions.map(option => (
          <TabsTrigger 
            key={option.id} 
            value={option.id} 
            className="flex-1 py-2 px-3 text-center whitespace-nowrap"
          >
            {isMobile ? option.shortLabel || option.label : option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default PeopleFilter;
