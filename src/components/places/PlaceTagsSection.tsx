import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';

interface PlaceTagsSectionProps {
  form: UseFormReturn<FormValues>;
  occasionOptions: { value: string; label: string }[];
  vibeOptions: { value: string; label: string }[];
}

export function PlaceTagsSection({ form, occasionOptions, vibeOptions }: PlaceTagsSectionProps) {
  // We're keeping this component for backward compatibility
  // but moving its content to PlaceDetailsSection
  return null;
}
