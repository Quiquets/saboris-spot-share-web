
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TagSelectorProps {
  label: string;
  options: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxSelection?: number;
  searchable?: boolean;
}

export function TagSelector({ 
  label, 
  options, 
  selectedTags, 
  onChange, 
  maxSelection,
  searchable = false
}: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      if (maxSelection && selectedTags.length >= maxSelection) {
        // Replace the oldest selected tag if we've hit max selection
        onChange([...selectedTags.slice(1), tag]);
      } else {
        onChange([...selectedTags, tag]);
      }
    }
  };

  const filteredOptions = searchable && searchTerm 
    ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="space-y-3">
      <label className="block font-medium text-gray-700">{label}</label>
      
      {searchable && (
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder={`Search ${label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 focus:border-saboris-primary"
          />
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {filteredOptions.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`rounded-full text-sm transition-all ${
              selectedTags.includes(tag) 
                ? "bg-saboris-primary hover:bg-saboris-primary/90 text-white" 
                : "border-gray-200 hover:border-saboris-primary hover:text-saboris-primary"
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Button>
        ))}
        
        {searchable && filteredOptions.length === 0 && searchTerm && (
          <div className="w-full text-center py-2 text-gray-500">
            No matches found
          </div>
        )}
      </div>
      
      {maxSelection && (
        <p className="text-xs text-gray-500">
          Select up to {maxSelection} {label.toLowerCase()} 
          (Selected: {selectedTags.length}/{maxSelection})
        </p>
      )}
    </div>
  );
}
