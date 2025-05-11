
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { FriendSelector } from '@/components/places/FriendSelector';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface FriendTagsSectionProps {
  form: UseFormReturn<FormValues>;
}

export function FriendTagsSection({ form }: FriendTagsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-1.5 h-6 bg-saboris-primary rounded-full"></span>
        Who Joined You?
      </h2>
      
      <FormField
        control={form.control}
        name="tagged_friends"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FriendSelector
                selectedFriends={field.value || []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
