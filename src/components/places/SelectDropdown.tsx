
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormLabel } from "@/components/ui/form";

interface SelectDropdownProps {
  options: { value: string; label: string }[];
  value?: string[];
  selectedValues?: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  label?: string;
  maxSelection?: number;
}

export function SelectDropdown({ 
  options, 
  value, 
  selectedValues, 
  onChange, 
  placeholder,
  label,
  maxSelection 
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  
  // Use either value or selectedValues (for backward compatibility)
  const currentValues = value || selectedValues || [];

  const toggleOption = (optionValue: string) => {
    let newValues: string[];
    
    if (currentValues.includes(optionValue)) {
      newValues = currentValues.filter((v) => v !== optionValue);
    } else {
      // If we've reached max selection, remove the first item
      if (maxSelection && currentValues.length >= maxSelection) {
        newValues = [...currentValues.slice(1), optionValue];
      } else {
        newValues = [...currentValues, optionValue];
      }
    }
    
    onChange(newValues);
  };

  const allSelected = currentValues.length === options.length;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
    }
  };

  return (
    <div className="space-y-2">
      {label && <FormLabel>{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {currentValues.length > 0
              ? currentValues
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
                    currentValues.includes(option.value) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {option.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
