
import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
            <FormItem>
              <FormControl>
                <SelectDropdown
                  label="Cuisine"
                  options={cuisineOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onChange={(values) => field.onChange(values.length > 0 ? values[0] : '')}
                  maxSelection={1}
                  placeholder="Select cuisine..."
                />
              </FormControl>
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
