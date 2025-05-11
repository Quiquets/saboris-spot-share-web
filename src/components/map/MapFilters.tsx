
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Filter, ArrowDown, ArrowUp, Sliders } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { filterOptions, ActiveFilters, FilterChangeHandler, PeopleFilterChangeHandler } from './FilterOptions';

interface MapFiltersProps {
  activeFilters: ActiveFilters;
  handleFilterChange: FilterChangeHandler;
  handlePeopleFilterChange: PeopleFilterChangeHandler;
  toggleSortDirection: (category: string) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ 
  activeFilters, 
  handleFilterChange, 
  handlePeopleFilterChange, 
  toggleSortDirection 
}) => {
  return (
    <div className="flex flex-col items-start w-full">
      {/* People filter tabs */}
      <Tabs 
        value={activeFilters.people} 
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

      {/* Horizontal filter bar with evenly distributed filters */}
      <div className="grid grid-cols-5 w-full mb-4 gap-2">
        {/* Occasion Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" 
              className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
              <Filter className="h-3 w-3 text-saboris-primary" /> 
              Occasion
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
              {filterOptions.occasion.map(option => (
                <Button 
                  key={option.id}
                  variant={activeFilters.occasion.includes(option.id) ? "default" : "outline"}
                  className={`text-xs px-2 py-1 ${activeFilters.occasion.includes(option.id) 
                    ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                    : "border-saboris-primary text-saboris-gray"}`}
                  onClick={() => {
                    const newFilters = activeFilters.occasion.includes(option.id)
                      ? activeFilters.occasion.filter(id => id !== option.id)
                      : [...activeFilters.occasion, option.id];
                    handleFilterChange('occasion', newFilters);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Food Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" 
              className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
              <Filter className="h-3 w-3 text-saboris-primary" /> 
              Food Type
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {filterOptions.foodType.map(option => (
                <Button 
                  key={option.id}
                  variant={activeFilters.foodType.includes(option.id) ? "default" : "outline"}
                  className={`justify-start text-xs px-2 py-1 ${activeFilters.foodType.includes(option.id) 
                    ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                    : "border-saboris-primary text-saboris-gray"}`}
                  onClick={() => {
                    const newFilters = activeFilters.foodType.includes(option.id)
                      ? activeFilters.foodType.filter(id => id !== option.id)
                      : [...activeFilters.foodType, option.id];
                    handleFilterChange('foodType', newFilters);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Vibe Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" 
              className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
              <Filter className="h-3 w-3 text-saboris-primary" /> 
              Vibe
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {filterOptions.vibe.map(option => (
                <Button 
                  key={option.id}
                  variant={activeFilters.vibe.includes(option.id) ? "default" : "outline"}
                  className={`justify-start text-xs px-2 py-1 ${activeFilters.vibe.includes(option.id) 
                    ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                    : "border-saboris-primary text-saboris-gray"}`}
                  onClick={() => {
                    const newFilters = activeFilters.vibe.includes(option.id)
                      ? activeFilters.vibe.filter(id => id !== filter.id)
                      : [...activeFilters.vibe, option.id];
                    handleFilterChange('vibe', newFilters);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" 
              className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
              <Filter className="h-3 w-3 text-saboris-primary" /> 
              Price
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="flex flex-wrap gap-2">
              {filterOptions.price.map(option => (
                <Button 
                  key={option.id}
                  variant={activeFilters.price.includes(option.id) ? "default" : "outline"}
                  className={`text-xs px-2 py-1 ${activeFilters.price.includes(option.id) 
                    ? "bg-saboris-primary text-white hover:bg-saboris-primary/90" 
                    : "border-saboris-primary text-saboris-gray"}`}
                  onClick={() => {
                    const newFilters = activeFilters.price.includes(option.id)
                      ? activeFilters.price.filter(id => id !== option.id)
                      : [...activeFilters.price, option.id];
                    handleFilterChange('price', newFilters);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* More Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" 
              className="w-full gap-1 px-2 py-1 text-sm border-saboris-primary text-saboris-gray">
              <Sliders className="h-3 w-3 text-saboris-primary" /> 
              More
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-medium mb-2 text-saboris-gray">Rating Criteria</h3>
                <div className="grid grid-cols-1 gap-2">
                  {filterOptions.additional.map(option => (
                    <Button 
                      key={option.id}
                      variant="outline"
                      className="justify-between text-xs px-2 py-1 w-full border-saboris-primary text-saboris-gray"
                      onClick={() => toggleSortDirection(option.id)}
                    >
                      {option.label}
                      {option.id === 'value' ? (
                        activeFilters.valueSortDirection === "desc" ? 
                        <ArrowDown className="h-3 w-3" /> : 
                        <ArrowUp className="h-3 w-3" />
                      ) : option.id === 'food-quality' ? (
                        activeFilters.foodSortDirection === "desc" ? 
                        <ArrowDown className="h-3 w-3" /> : 
                        <ArrowUp className="h-3 w-3" />
                      ) : option.id === 'service' ? (
                        activeFilters.serviceSortDirection === "desc" ? 
                        <ArrowDown className="h-3 w-3" /> : 
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        activeFilters.atmosphereSortDirection === "desc" ? 
                        <ArrowDown className="h-3 w-3" /> : 
                        <ArrowUp className="h-3 w-3" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filter badges */}
      {(activeFilters.occasion.length > 0 || activeFilters.foodType.length > 0 || 
        activeFilters.vibe.length > 0 || activeFilters.price.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {activeFilters.occasion.map(filter => (
            <Badge 
              key={filter} 
              variant="outline"
              className="cursor-pointer border-saboris-primary text-saboris-gray"
              onClick={() => {
                const newFilters = activeFilters.occasion.filter(id => id !== filter);
                handleFilterChange('occasion', newFilters);
              }}
            >
              {filterOptions.occasion.find(o => o.id === filter)?.label}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          
          {activeFilters.foodType.map(filter => (
            <Badge 
              key={filter} 
              variant="outline"
              className="cursor-pointer border-saboris-primary text-saboris-gray"
              onClick={() => {
                const newFilters = activeFilters.foodType.filter(id => id !== filter);
                handleFilterChange('foodType', newFilters);
              }}
            >
              {filterOptions.foodType.find(o => o.id === filter)?.label}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          
          {activeFilters.vibe.map(filter => (
            <Badge 
              key={filter} 
              variant="outline"
              className="cursor-pointer border-saboris-primary text-saboris-gray"
              onClick={() => {
                const newFilters = activeFilters.vibe.filter(id => id !== filter);
                handleFilterChange('vibe', newFilters);
              }}
            >
              {filterOptions.vibe.find(o => o.id === filter)?.label}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          
          {activeFilters.price.map(filter => (
            <Badge 
              key={filter} 
              variant="outline"
              className="cursor-pointer border-saboris-primary text-saboris-gray"
              onClick={() => {
                const newFilters = activeFilters.price.filter(id => id !== filter);
                handleFilterChange('price', newFilters);
              }}
            >
              {filterOptions.price.find(o => o.id === filter)?.label}
              <span className="ml-1">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapFilters;
