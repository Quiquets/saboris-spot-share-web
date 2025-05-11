
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, featureName, redirectTo = '/' }: ProtectedRouteProps) => {
  const { user, setShowAuthModal, setFeatureName } = useAuth();
  
  useEffect(() => {
    if (!user && featureName) {
      // Set the feature name in the auth context
      setFeatureName(featureName);
      
      // Show the auth modal
      setShowAuthModal(true);
    }
  }, [user, featureName, setShowAuthModal, setFeatureName]);
  
  if (user) {
    return <>{children}</>;
  }
  
  return <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
