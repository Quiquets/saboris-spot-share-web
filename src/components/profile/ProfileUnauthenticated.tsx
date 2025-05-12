
import { UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProfileUnauthenticated = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <UserIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Sign In Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to view your profile and shared places.</p>
          <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90">
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileUnauthenticated;
