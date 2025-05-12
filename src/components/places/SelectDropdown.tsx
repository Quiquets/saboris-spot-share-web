
import { useState } from "react";
import { FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface SelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxSelection?: number;
  placeholder?: string;
}

export function SelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  maxSelection = 5,
  placeholder = "Select options...",
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelect = (value: string) => {
    // If already selected, remove it
    if (selectedValues.includes(value)) {
      const newValues = selectedValues.filter(v => v !== value);
      onChange(newValues);
      return;
    }
    
    // If at max selection, remove the first one
    if (maxSelection && selectedValues.length >= maxSelection) {
      const newValues = [...selectedValues.slice(1), value];
      onChange(newValues);
      return;
    }
    
    // Otherwise add it
    const newValues = [...selectedValues, value];
    onChange(newValues);
  };

  const handleRemove = (valueToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Create a new array without the removed value to ensure state update triggers
    const newValues = selectedValues.filter((value) => value !== valueToRemove);
    onChange(newValues);
  };

  const getSelectedLabels = () => {
    return selectedValues.map((value) => {
      const option = options.find((opt) => opt.value === value);
      return option ? option.label : value;
    });
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className="space-y-1 md:space-y-2">
      <FormLabel className="text-gray-700">{label}</FormLabel>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal border-2 h-auto py-1.5 md:py-2 px-2 md:px-3 bg-white min-h-10"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
          >
            <div className="flex flex-wrap gap-1 items-center flex-grow justify-start">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground text-xs md:text-sm">{placeholder}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedLabels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 text-xs py-0.5 md:py-1">
                      {label}
                      <button
                        type="button"
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={(e) => handleRemove(selectedValues[index], e)}
                      >
                        <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4 opacity-50 ml-1 md:ml-2 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
          <ScrollArea className="h-[150px] md:h-[200px]">
            <div className="p-1">
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className={`flex items-center justify-between space-x-2 text-xs md:text-sm ${
                    selectedValues.includes(option.value) ? "bg-muted" : ""
                  }`}
                  onSelect={(event) => {
                    event.preventDefault();
                    handleSelect(option.value);
                  }}
                >
                  <span>{option.label}</span>
                  {selectedValues.includes(option.value) && (
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-primary rounded-full"></span>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
          {maxSelection && (
            <div className="px-2 py-1 text-xs border-t text-muted-foreground">
              Select up to {maxSelection} (Selected: {selectedValues.length}/{maxSelection})
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
