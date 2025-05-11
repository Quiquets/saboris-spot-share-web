
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { StarRating } from '@/components/places/StarRating';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface PlaceRatingsSectionProps {
  form: UseFormReturn<FormValues>;
}

export function PlaceRatingsSection({ form }: PlaceRatingsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
        Your Ratings
      </h2>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="rating_food"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarRating
                  label="Food Quality"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rating_service"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarRating
                  label="Service"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rating_atmosphere"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarRating
                  label="Atmosphere"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rating_value"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarRating
                  label="Value for Money"
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
