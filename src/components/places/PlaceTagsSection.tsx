
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';
import { SelectDropdown } from '@/components/places/SelectDropdown';

interface PlaceTagsSectionProps {
  form: UseFormReturn<FormValues>;
  occasionOptions: { value: string; label: string }[];
  vibeOptions: { value: string; label: string }[];
}

export function PlaceTagsSection({ form, occasionOptions, vibeOptions }: PlaceTagsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
        Tags & Occasion
      </h2>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="occasions"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <SelectDropdown
                  label="Occasion"
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
        
        <FormField
          control={form.control}
          name="vibes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <SelectDropdown
                  label="Vibe"
                  options={vibeOptions}
                  selectedValues={field.value || []}
                  onChange={field.onChange}
                  maxSelection={5}
                  placeholder="Select vibes..."
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
