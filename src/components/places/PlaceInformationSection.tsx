
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { PlaceAutocomplete } from '@/components/places/PlaceAutocomplete';
import { PlaceTypeToggle } from '@/components/places/PlaceTypeToggle';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface PlaceInformationSectionProps {
  form: UseFormReturn<FormValues>;
  handlePlaceSelect: (placeDetails: any) => void;
  isSubmitting: boolean;
}

export function PlaceInformationSection({ 
  form, 
  handlePlaceSelect, 
  isSubmitting 
}: PlaceInformationSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
        Place Information
      </h2>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="place_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Place Name</FormLabel>
              <FormControl>
                <PlaceAutocomplete 
                  value={field.value}
                  onPlaceSelect={handlePlaceSelect}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Location</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-saboris-primary" />
                  <Input 
                    {...field}
                    placeholder="Address will be filled automatically"
                    disabled={true}
                    className="bg-gray-50 border rounded-xl"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="place_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Place Type</FormLabel>
              <FormControl>
                <PlaceTypeToggle
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
