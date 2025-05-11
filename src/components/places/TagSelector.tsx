
import { Button } from "@/components/ui/button";

interface TagSelectorProps {
  label: string;
  options: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxSelection?: number;
}

export function TagSelector({ 
  label, 
  options, 
  selectedTags, 
  onChange, 
  maxSelection 
}: TagSelectorProps) {
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

  return (
    <div className="space-y-2">
      <label className="block font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`rounded-full text-sm ${
              selectedTags.includes(tag) 
                ? "bg-saboris-primary hover:bg-saboris-primary/90" 
                : "hover:bg-gray-100"
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
}
