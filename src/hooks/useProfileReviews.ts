
import { useState } from 'react';
import { SharedPlace } from '@/types/profile';

export const useProfileReviews = () => {
  const [selectedPlace, setSelectedPlace] = useState<SharedPlace | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const openReviewDialog = (place: SharedPlace) => {
    setSelectedPlace(place);
    setIsReviewDialogOpen(true);
  };
  
  return {
    selectedPlace,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    openReviewDialog
  };
};
