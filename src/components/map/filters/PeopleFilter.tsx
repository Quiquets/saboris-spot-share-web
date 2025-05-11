
import React from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { filterOptions } from '../FilterOptions';

interface PeopleFilterProps {
  activePeople: string;
  handlePeopleFilterChange: (value: string) => void;
}

const PeopleFilter: React.FC<PeopleFilterProps> = ({ 
  activePeople, 
  handlePeopleFilterChange 
}) => {
  return (
    <Tabs 
      value={activePeople} 
      className="w-full mb-4"
      onValueChange={handlePeopleFilterChange}
    >
      <TabsList className="grid grid-cols-3 mb-4 w-full">
        {filterOptions.people.map(option => (
          <TabsTrigger 
            key={option.id} 
            value={option.id} 
            className="flex-1 whitespace-nowrap"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default PeopleFilter;
