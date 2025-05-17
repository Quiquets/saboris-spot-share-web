import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Star, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SharedPlace } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/places/ImageUpload';

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlace: SharedPlace | null; // SharedPlace might contain review details
  onPlaceDeleted: () => void; // This should be more like onReviewUpdatedOrDeleted
}

const ReviewDialog = ({ isOpen, onOpenChange, selectedPlace, onPlaceDeleted }: ReviewDialogProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]); // This will hold URLs from photo_urls

  // Initialize editing state when dialog opens or selected place changes
  useEffect(() => {
    if (selectedPlace) {
      setReviewText(selectedPlace.review_text || '');
      // Use photo_urls from selectedPlace (which comes from reviews table's photo_urls)
      setPhotos(selectedPlace.photo_urls || []); 
      setIsEditing(false); // Reset editing state when place changes
    }
  }, [selectedPlace]);

  if (!selectedPlace) return null;
  
  // Assuming selectedPlace.type === 'review' or selectedPlace.created_by is the review author
  const isOwner = user?.id === selectedPlace.created_by; 

  const handleSaveChanges = async () => {
    if (!selectedPlace || !user || selectedPlace.type !== 'review') { // Ensure it's a review
        toast.error("Cannot update. Selected item is not a review or user mismatch.");
        return;
    }
    
    try {
      // Update the review in 'reviews' table
      const { error } = await supabase
        .from('reviews')
        .update({ 
          text: reviewText,
          photo_urls: photos // Save the array of photo URLs
        })
        .eq('id', selectedPlace.id); // selectedPlace.id should be review_id

      if (error) throw error;
      
      toast.success('Review updated successfully');
      setIsEditing(false); // Exit editing mode
      onOpenChange(false); // Close dialog
      onPlaceDeleted(); // Refresh profile data
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review');
    }
  };

  const handleDeletePlace = async () => {
    if (!selectedPlace || !user) return;
    
    // This function seems to handle deleting reviews and potentially places.
    // Needs to be clear based on selectedPlace.type
    if (selectedPlace.type !== 'review' && selectedPlace.type !== 'place') {
        toast.error("Cannot delete. Unknown item type.");
        return;
    }

    setIsDeleting(true);
    try {
      if (selectedPlace.type === 'review') {
        // Delete the review
        const { error: reviewError } = await supabase
          .from('reviews')
          .delete()
          .eq('id', selectedPlace.id); // selectedPlace.id is review_id
        if (reviewError) throw reviewError;
        toast.success('Review deleted successfully');

        // Check if the associated place was also created by this user and has no other reviews.
        // This logic might be too complex for this dialog and better handled by specific backend logic or admin tools.
        // For now, only delete the review.
      } else if (selectedPlace.type === 'place') {
        // This case is if a "SharedPlace" item is a "place" itself.
        // The original logic for deleting places and their related reviews/wishlists:
        const { error: placeError } = await supabase
            .from('places')
            .delete()
            .eq('id', selectedPlace.place_id); // place_id from SharedPlace
        if (placeError) throw placeError;

        // Also delete reviews and wishlists associated with this place_id
        await supabase.from('reviews').delete().eq('place_id', selectedPlace.place_id);
        await supabase.from('wishlists').delete().eq('place_id', selectedPlace.place_id);
        toast.success('Place and its associated data deleted successfully');
      }
      
      onOpenChange(false); // Close dialog
      onPlaceDeleted();   // Refresh profile data
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setIsEditing(false); // Reset editing state on close
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">{selectedPlace.place.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {selectedPlace.rating !== undefined && ( // Check for undefined explicitly for rating
            <div className="flex items-center mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < (selectedPlace.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                />
              ))}
              <span className="ml-2 font-medium text-gray-800">{selectedPlace.rating}/5</span>
            </div>
          )}
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Your Review
                </label>
                <textarea 
                  value={reviewText} 
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border rounded-md p-2 min-h-[100px] text-gray-800"
                  placeholder="Share your experience..."
                />
              </div>
              
              <div>
                <ImageUpload 
                  images={photos} 
                  onChange={setPhotos}
                  maxImages={3} 
                  itemId={selectedPlace.id} // Pass review_id as itemId for path construction
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 whitespace-pre-line">
                {selectedPlace.review_text || "No detailed review was provided."}
              </p>
              
              {/* Display multiple photos if available */}
              {photos && photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photos.map((photoUrl, index) => (
                    <div key={index} className="aspect-square">
                      <img 
                        src={photoUrl} 
                        alt={`Review photo ${index + 1}`} 
                        className="w-full h-full object-cover rounded-md" 
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {selectedPlace.place.tags && selectedPlace.place.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {selectedPlace.place.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {selectedPlace.place.address && (
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedPlace.place.address}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                className="bg-saboris-primary hover:bg-saboris-primary/90 flex-1"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="bg-saboris-primary hover:bg-saboris-primary/90 flex-1"
                asChild
              >
                <Link to={`/map?place=${selectedPlace.place_id}`}>
                  <MapPin className="h-4 w-4 mr-1" />
                  View on Map
                </Link>
              </Button>
              
              {isOwner && selectedPlace.type === 'review' && ( // Only allow edit/delete if it's a review and user is owner
                <>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Review
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Review
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this review. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlace} disabled={isDeleting}>
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
