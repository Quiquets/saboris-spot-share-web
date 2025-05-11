
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface PlaceVisibilityToggleProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export function PlaceVisibilityToggle({ form, isSubmitting }: PlaceVisibilityToggleProps) {
  return (
    <FormField
      control={form.control}
      name="is_public"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div>
            <FormLabel className="text-gray-700 font-medium">Post Visibility</FormLabel>
            <p className="text-sm text-gray-500">
              {field.value ? "Visible to everyone" : "Visible only to your followers"}
            </p>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isSubmitting}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
