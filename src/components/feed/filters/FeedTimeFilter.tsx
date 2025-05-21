
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimeFilterOption } from '@/services/feedService';

interface FeedTimeFilterProps {
  activeFilter: TimeFilterOption;
  onFilterChange: (value: TimeFilterOption) => void;
}

const timeFilterOptions: { id: TimeFilterOption; label: string; shortLabel: string }[] = [
  { id: '1 day', label: 'Last Day', shortLabel: 'Day' },
  { id: '7 days', label: 'Last 7 Days', shortLabel: 'Week' },
  { id: '30 days', label: 'Last 30 Days', shortLabel: 'Month' },
  { id: 'all_time', label: 'All Time', shortLabel: 'All' },
];

const FeedTimeFilter: React.FC<FeedTimeFilterProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="w-full mb-6">
      <ToggleGroup
        type="single"
        value={activeFilter}
        onValueChange={(value: TimeFilterOption) => {
          if (value) onFilterChange(value);
        }}
        className="w-full grid grid-cols-4 gap-2"
      >
        {timeFilterOptions.map(option => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            aria-label={option.label}
            className={`text-xs h-9 flex-1 data-[state=on]:bg-saboris-primary data-[state=on]:text-white border-saboris-primary text-saboris-gray`}
          >
            {option.shortLabel}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default FeedTimeFilter;
