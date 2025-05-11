
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AccessGateModal from './AccessGateModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, featureName, redirectTo = '/' }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(!user);
  
  if (user) {
    return <>{children}</>;
  }
  
  return (
    <>
      <AccessGateModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        featureName={featureName}
      />
      <Navigate to={redirectTo} replace />
    </>
  );
};

export default ProtectedRoute;
