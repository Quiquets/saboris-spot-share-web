
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
    <div className="w-full mb-4">
      <Tabs 
        value={activePeople} 
        onValueChange={handlePeopleFilterChange}
      >
        <TabsList 
          className="w-full flex justify-center bg-gray-100 p-1 rounded-full"
        >
          {availableOptions.map(option => (
            <TabsTrigger 
              key={option.id} 
              value={option.id} 
              className="flex-1 py-2 px-4 text-center data-[state=active]:bg-white data-[state=active]:text-saboris-primary data-[state=active]:shadow-sm rounded-full"
            >
              {isMobile ? option.shortLabel || option.label : option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PeopleFilter;
