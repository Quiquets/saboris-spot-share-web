
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterOptions } from '../FilterOptions';

interface PeopleFilterProps {
  activePeople: string;
  handlePeopleFilterChange: (value: string) => void;
}

const PeopleFilter: React.FC<PeopleFilterProps> = ({ activePeople, handlePeopleFilterChange }) => {
  return (
    <div className="w-full mb-4">
      <Tabs value={activePeople} onValueChange={handlePeopleFilterChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-12">
          {filterOptions.people.map(option => (
            <TabsTrigger
              key={option.id}
              value={option.id}
              className={`px-4 py-2 data-[state=active]:bg-saboris-primary data-[state=active]:text-white`}
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PeopleFilter;
