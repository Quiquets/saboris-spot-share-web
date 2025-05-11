
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SharedPlace } from '@/types/profile';

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlace: SharedPlace | null;
}

const ReviewDialog = ({ isOpen, onOpenChange, selectedPlace }: ReviewDialogProps) => {
  if (!selectedPlace) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{selectedPlace.place.name}</DialogTitle>
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
            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {selectedPlace.place.address}
            </div>
          )}
        </div>
        
        <Button 
          className="mt-2 w-full bg-saboris-primary hover:bg-saboris-primary/90"
          asChild
        >
          <Link to={`/map?place=${selectedPlace.place_id}`}>
            <MapPin className="h-4 w-4 mr-1" />
            View on Map
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
