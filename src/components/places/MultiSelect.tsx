
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelection?: number;
}

export function MultiSelect({ options, onChange, placeholder = "Select...", maxSelection }: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    let newSelectedValues: string[];
    
    if (selectedValues.includes(optionValue)) {
      newSelectedValues = selectedValues.filter((v) => v !== optionValue);
    } else {
      // If we've reached max selection, remove the first item
      if (maxSelection && selectedValues.length >= maxSelection) {
        newSelectedValues = [...selectedValues.slice(1), optionValue];
      } else {
        newSelectedValues = [...selectedValues, optionValue];
      }
    }
    
    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
  };

  const allSelected = selectedValues.length === options.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedValues([]);
      onChange([]);
    } else {
      const newSelectedValues = options.map((option) => option.value);
      setSelectedValues(newSelectedValues);
      onChange(newSelectedValues);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedValues.length > 0
            ? selectedValues
                .map(
                  (v) => options.find((option) => option.value === v)?.label
                )
                .filter(Boolean)
                .join(", ")
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <div className="p-1">
          <Button
            variant="ghost"
            className="justify-start px-2 py-1.5"
            onClick={toggleAll}
          >
            <Check
              className={`mr-2 h-4 w-4 ${
                allSelected ? "opacity-100" : "opacity-0"
              }`}
            />
            Select All
          </Button>
          {options.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className="justify-start px-2 py-1.5"
              onClick={() => toggleOption(option.value)}
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                }`}
              />
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
