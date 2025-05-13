
import { UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const ProfileUnauthenticated = () => {
  const { setShowAuthModal } = useAuth();

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-10 sm:py-16 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-6 sm:p-8 rounded-xl shadow-sm">
          <div className="rounded-full bg-gray-100 p-5 sm:p-6 mx-auto mb-4 sm:mb-6 w-fit">
            <UserIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800">Sign In Required</h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Please sign in to view your profile and shared places.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleSignInClick}
              className="bg-saboris-primary hover:bg-saboris-primary/90 w-full sm:w-auto"
            >
              Sign In
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileUnauthenticated;
