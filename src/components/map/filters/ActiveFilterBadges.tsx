
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { filterOptions } from '../FilterOptions';

interface ActiveFilterBadgesProps {
  activeOccasions: string[];
  activeFoodTypes: string[];
  activeVibes: string[];
  activePrices: string[];
  handleFilterChange: (type: string, value: string[]) => void;
}

const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  activeOccasions,
  activeFoodTypes,
  activeVibes,
  activePrices,
  handleFilterChange
}) => {
  if (activeOccasions.length === 0 && activeFoodTypes.length === 0 && 
      activeVibes.length === 0 && activePrices.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {activeOccasions.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = activeOccasions.filter(id => id !== filter);
            handleFilterChange('occasion', newFilters);
          }}
        >
          {filterOptions.occasion.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
      
      {activeFoodTypes.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = activeFoodTypes.filter(id => id !== filter);
            handleFilterChange('foodType', newFilters);
          }}
        >
          {filterOptions.foodType.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
      
      {activeVibes.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = activeVibes.filter(id => id !== filter);
            handleFilterChange('vibe', newFilters);
          }}
        >
          {filterOptions.vibe.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
      
      {activePrices.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = activePrices.filter(id => id !== filter);
            handleFilterChange('price', newFilters);
          }}
        >
          {filterOptions.price.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
    </div>
  );
};

export default ActiveFilterBadges;
