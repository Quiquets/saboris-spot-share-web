
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AccessGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const AccessGateModal = ({ isOpen, onClose, featureName = 'this feature' }: AccessGateModalProps) => {
  const { setShowAuthModal, setFeatureName } = useAuth();
  
  // When this modal is shown, we now trigger the main auth modal instead
  if (isOpen) {
    // Store the current location for redirect after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
    
    // Set the feature name in the auth context
    setFeatureName(featureName);
    
    // Show the main auth modal
    setShowAuthModal(true);
    
    // Close this modal since we're using the main auth modal instead
    onClose();
  }
  
  // This component no longer renders anything - it just triggers the main auth modal
  return null;
};

export default AccessGateModal;
