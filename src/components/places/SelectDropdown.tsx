import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectDropdownProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}

export function SelectDropdown({ options, value, onChange, placeholder }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const allSelected = value.length === options.length;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
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
          {value.length > 0
            ? value
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
                  value.includes(option.value) ? "opacity-100" : "opacity-0"
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
