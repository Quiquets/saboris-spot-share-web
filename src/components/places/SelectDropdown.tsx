
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

  const handleSelect = (value: string) => {
    // If already selected, remove it
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
      return;
    }
    
    // If at max selection, remove the first one
    if (maxSelection && selectedValues.length >= maxSelection) {
      onChange([...selectedValues.slice(1), value]);
      return;
    }
    
    // Otherwise add it
    onChange([...selectedValues, value]);
  };

  const handleRemove = (valueToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onChange(selectedValues.filter((value) => value !== valueToRemove));
  };

  const getSelectedLabels = () => {
    return selectedValues.map((value) => {
      const option = options.find((opt) => opt.value === value);
      return option ? option.label : value;
    });
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className="space-y-2">
      <FormLabel className="text-gray-700">{label}</FormLabel>
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal border-2 h-auto py-2 px-3 bg-white"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
          >
            <div className="flex flex-wrap gap-1 items-center flex-grow justify-start">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedLabels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="mr-1">
                      {label}
                      <button
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(selectedValues[index]);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className={`flex items-center justify-between space-x-2 ${
                    selectedValues.includes(option.value) ? "bg-muted" : ""
                  }`}
                  onSelect={(event) => {
                    event.preventDefault();
                    handleSelect(option.value);
                  }}
                >
                  <span>{option.label}</span>
                  {selectedValues.includes(option.value) && (
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
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
