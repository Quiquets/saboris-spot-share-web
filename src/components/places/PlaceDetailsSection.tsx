
import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { ChevronDown } from 'lucide-react';
import { PriceRangeSelector } from '@/components/places/PriceRangeSelector';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';
import { SelectDropdown } from '@/components/places/SelectDropdown';

interface PlaceDetailsSectionProps {
  form: UseFormReturn<FormValues>;
  cuisineOptions?: { value: string; label: string }[];
  occasionOptions?: { value: string; label: string }[];
  vibeOptions?: { value: string; label: string }[];
}

export function PlaceDetailsSection({ 
  form, 
  cuisineOptions = [], 
  occasionOptions = [], 
  vibeOptions = [] 
}: PlaceDetailsSectionProps) {
  const [openCuisine, setOpenCuisine] = useState(false);
  
  // Debug logs
  console.log('cuisineOptions', cuisineOptions);
  console.log('selectedCuisine', form.watch('cuisine'));
  
  // Safe version of cuisineOptions that's guaranteed to be an array
  const cuisineOptionsSafe = cuisineOptions || [];
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
        Details
      </h2>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="cuisine"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-gray-700 font-medium">Cuisine</FormLabel>
              <Popover open={openCuisine} onOpenChange={setOpenCuisine}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCuisine}
                      className="justify-between w-full border-2 rounded-xl bg-white"
                    >
                      {field.value
                        ? cuisineOptionsSafe.find(
                            (cuisine) => cuisine.value === field.value
                          )?.label || "Unknown cuisine"
                        : "Select cuisine..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search cuisine..." />
                    <CommandEmpty>No cuisine found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {cuisineOptionsSafe.map((cuisine) => (
                        <CommandItem
                          key={cuisine.value}
                          value={cuisine.label}
                          onSelect={() => {
                            form.setValue("cuisine", cuisine.value);
                            setOpenCuisine(false);
                          }}
                        >
                          {cuisine.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {vibeOptions.length > 0 && (
          <FormField
            control={form.control}
            name="vibes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectDropdown
                    label="Vibes"
                    options={vibeOptions}
                    selectedValues={field.value || []}
                    onChange={field.onChange}
                    maxSelection={3}
                    placeholder="Select vibes..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {occasionOptions.length > 0 && (
          <FormField
            control={form.control}
            name="occasions"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectDropdown
                    label="Occasions"
                    options={occasionOptions}
                    selectedValues={field.value || []}
                    onChange={field.onChange}
                    maxSelection={2}
                    placeholder="Select occasions..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="price_range"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PriceRangeSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
