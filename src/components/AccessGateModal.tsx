
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface AccessGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const AccessGateModal = ({ isOpen, onClose, featureName = 'this feature' }: AccessGateModalProps) => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Store the current path for redirect after login
      localStorage.setItem('redirectAfterLogin', location.pathname);
      await signInWithGoogle();
      // The redirect will happen automatically on auth state change
    } catch (error) {
      console.error("Google sign in error:", error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-4">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-medium mb-2">Sign in to access {featureName}</h3>
            <p className="text-sm text-gray-500">
              You need to be signed in to use this feature.
            </p>
          </div>
          
          <Button 
            onClick={handleGoogleAuth}
            className="w-full bg-saboris-primary text-white hover:bg-saboris-primary/90"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In with Google'}
          </Button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-800"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessGateModal;
