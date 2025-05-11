
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Share } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/types/place';
import { useNavigate } from 'react-router-dom';

interface PlaceSubmitSectionProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
  showFriendSelector: boolean;
  isFormValid: () => boolean;
}

export function PlaceSubmitSection({ 
  form, 
  isSubmitting, 
  showFriendSelector, 
  isFormValid 
}: PlaceSubmitSectionProps) {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex justify-center">
        <Button
          type="submit"
          className={`py-6 text-lg rounded-xl transition-all transform hover:scale-[1.02] w-full max-w-md ${
            showFriendSelector 
              ? "bg-saboris-primary hover:bg-saboris-primary/90" 
              : "bg-saboris-primary hover:bg-saboris-primary/90"
          }`}
          disabled={isSubmitting || (!showFriendSelector && !isFormValid())}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {showFriendSelector ? "Sharing..." : "Adding..."}
            </>
          ) : (
            <>
              {showFriendSelector ? (
                <>
                  <Share className="mr-2 h-5 w-5" />
                  Share with your friends!
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Place
                </>
              )}
            </>
          )}
        </Button>
      </div>
      
      {showFriendSelector && (
        <div className="text-center text-sm text-gray-500 pt-2">
          or{" "}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-saboris-primary hover:underline font-medium"
          >
            Skip this step
          </button>
        </div>
      )}
    </>
  );
}
