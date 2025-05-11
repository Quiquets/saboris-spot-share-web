
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
  // Ensure all arrays are initialized
  const occasions = activeOccasions || [];
  const foodTypes = activeFoodTypes || [];
  const vibes = activeVibes || [];
  const prices = activePrices || [];
  
  if (occasions.length === 0 && foodTypes.length === 0 && 
      vibes.length === 0 && prices.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {occasions.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = occasions.filter(id => id !== filter);
            handleFilterChange('occasion', newFilters);
          }}
        >
          {filterOptions.occasion.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
      
      {foodTypes.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = foodTypes.filter(id => id !== filter);
            handleFilterChange('foodType', newFilters);
          }}
        >
          {filterOptions.foodType.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
      
      {vibes.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = vibes.filter(id => id !== filter);
            handleFilterChange('vibe', newFilters);
          }}
        >
          {filterOptions.vibe.find(o => o.id === filter)?.label}
          <span className="ml-1">×</span>
        </Badge>
      ))}
      
      {prices.map(filter => (
        <Badge 
          key={filter} 
          variant="outline"
          className="cursor-pointer border-saboris-primary text-saboris-gray"
          onClick={() => {
            const newFilters = prices.filter(id => id !== filter);
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
