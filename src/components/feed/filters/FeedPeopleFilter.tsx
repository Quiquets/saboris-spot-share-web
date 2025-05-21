
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PeopleFilterOption } from '@/services/feedService';

interface FeedPeopleFilterProps {
  activeFilter: PeopleFilterOption;
  onFilterChange: (value: PeopleFilterOption) => void;
}

const peopleFilterOptions: { id: PeopleFilterOption; label: string; shortLabel: string }[] = [
  { id: 'my_friends', label: 'My Friends', shortLabel: 'Friends' },
  { id: 'friends_and_their_friends', label: 'Friends & Their Friends', shortLabel: 'Friends & Theirs' },
  { id: 'community', label: 'Community', shortLabel: 'Community' },
];

const FeedPeopleFilter: React.FC<FeedPeopleFilterProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="w-full mb-4">
      <ToggleGroup
        type="single"
        value={activeFilter}
        onValueChange={(value: PeopleFilterOption) => {
          if (value) onFilterChange(value);
        }}
        className="w-full grid grid-cols-3 gap-2"
      >
        {peopleFilterOptions.map(option => (
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

export default FeedPeopleFilter;
