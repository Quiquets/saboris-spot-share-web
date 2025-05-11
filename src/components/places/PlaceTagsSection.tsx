
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { TagSelector } from '@/components/places/TagSelector';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

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
                <TagSelector
                  label="Occasion"
                  options={occasionOptions.map(o => o.label)}
                  selectedTags={field.value || []}
                  onChange={field.onChange}
                  maxSelection={5}
                  className="rounded-full"
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
                <TagSelector
                  label="Vibe"
                  options={vibeOptions.map(v => v.label)}
                  selectedTags={field.value || []}
                  onChange={field.onChange}
                  maxSelection={5}
                  searchable={true}
                  className="rounded-full"
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
