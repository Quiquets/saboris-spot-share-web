
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface PlaceExperienceSectionProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export function PlaceExperienceSection({ form, isSubmitting }: PlaceExperienceSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
        Your Experience
      </h2>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">What made this place special?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Share your experience..."
                  className="min-h-[100px] border-2 focus:border-saboris-primary resize-none rounded-xl"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ordered_items"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">What did you order?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="List the dishes you tried..."
                  className="border-2 focus:border-saboris-primary resize-none rounded-xl"
                  disabled={isSubmitting}
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
