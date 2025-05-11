
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const SavedPlacesPage = () => {
  useEffect(() => {
    document.title = 'Redirecting to Profile';
  }, []);

  // Redirect to the profile page where saved places are now shown
  return <Navigate to="/profile" replace />;
};

export default SavedPlacesPage;
