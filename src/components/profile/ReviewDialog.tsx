
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Star, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SharedPlace } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/places/ImageUpload';

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlace: SharedPlace | null;
  onPlaceDeleted: () => void;
}

const ReviewDialog = ({ isOpen, onOpenChange, selectedPlace, onPlaceDeleted }: ReviewDialogProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  // Initialize editing state when dialog opens
  useState(() => {
    if (selectedPlace) {
      setReviewText(selectedPlace.review_text || '');
      setPhotos(selectedPlace.photo_urls || []);
    }
  });

  if (!selectedPlace) return null;
  
  const isOwner = user?.id === selectedPlace.created_by;

  const handleSaveChanges = async () => {
    if (!selectedPlace || !user) return;
    
    try {
      // Update the review
      const { error } = await supabase
        .from('reviews')
        .update({ 
          text: reviewText,
          photo_url: photos.length > 0 ? photos[0] : null,
          photo_urls: photos
        })
        .eq('id', selectedPlace.id);

      if (error) throw error;
      
      toast.success('Review updated successfully');
      onOpenChange(false);
      // Force refresh of the profile page
      onPlaceDeleted();
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review');
    }
  };

  const handleDeletePlace = async () => {
    if (!selectedPlace || !user) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', selectedPlace.id);
        
      if (reviewError) throw reviewError;

      // If it was also a place created by the user, delete it
      if (selectedPlace.created_by === user.id) {
        const { error: placeError } = await supabase
          .from('places')
          .delete()
          .eq('id', selectedPlace.place_id);
          
        if (placeError) throw placeError;
      }
      
      toast.success('Place deleted successfully');
      onOpenChange(false);
      onPlaceDeleted();
    } catch (error: any) {
      console.error('Error deleting place:', error);
      toast.error(error.message || 'Failed to delete place');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">{selectedPlace.place.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {selectedPlace.rating && (
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
                />
              </div>
              
              <div>
                <ImageUpload 
                  images={photos} 
                  onChange={setPhotos}
                  maxImages={3} 
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 whitespace-pre-line">
                {selectedPlace.review_text || "No detailed review was provided."}
              </p>
              
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
              
              {isOwner && (
                <>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this place from your profile.
                          This action cannot be undone.
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
