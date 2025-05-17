import { FormField, FormLabel, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/places/ImageUpload';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface PlacePhotosSectionProps {
  form: UseFormReturn<FormValues>;
  googleMapPhoto: string | null;
}

export function PlacePhotosSection({ form, googleMapPhoto }: PlacePhotosSectionProps) {
  // Assuming FormValues might have an 'id' property when editing an existing place.
  // The TS error indicates 'id' is not directly on FormValues.
  // Using 'as any' as a temporary workaround. The FormValues type itself might need adjustment.
  const placeId = (form.getValues() as any).id || (form.getValues() as any).place_id; 

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <FormField
        control={form.control}
        name="photo_urls" 
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
              Photos
            </FormLabel>
            <FormControl>
              <ImageUpload
                images={field.value || []}
                onChange={(newUrls) => {
                  field.onChange(newUrls);
                  form.setValue('photo_urls', newUrls, { shouldValidate: true, shouldDirty: true });
                }}
                maxImages={3}
                itemId={placeId} 
                bucketName="post-pictures" // Explicitly set bucket for place photos
              />
            </FormControl>
            <FormMessage />
            {googleMapPhoto && (!field.value || field.value.length === 0) && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Google Maps photo available:</p>
                <div className="mt-2 relative h-40 w-40">
                  <img 
                    src={googleMapPhoto}
                    alt="Google Maps photo"
                    className="h-full w-full object-cover rounded-md"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Default picture
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Will be used if no photos are uploaded</p>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
