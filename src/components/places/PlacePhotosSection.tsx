// src/components/places/PlacePhotosSection.tsx
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "./ImageUpload";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "@/types/place";

export function PlacePhotosSection({
  form,
  googleMapPhoto
}: {
  form: UseFormReturn<FormValues>;
  googleMapPhoto: string | null;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="photo_urls"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ImageUpload
                images={field.value || []}
                onChange={field.onChange}
                maxImages={3}
                itemId={form.getValues().place_id}
                bucketName="post-pictures"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Fallback to Google Maps photo when no uploads */}
      {googleMapPhoto && (form.getValues().photo_urls || []).length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          No uploads yet — using map photo preview. It will be replaced once you upload.
        </p>
      )}
    </>
  );
}
