
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { MapPin, PlusCircle, User } from 'lucide-react';
import HeroSection from '@/components/HeroSection';

const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col w-full">
      {/* Include Header for consistency across all pages */}
      <Header />
      
      {/* Hero section - Use the updated HeroSection component */}
      <HeroSection />
      
      {/* Feature Cards Section - Updated with circular icons instead of cards */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-saboris-primary mb-8">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center h-full">
              <div className="rounded-full bg-saboris-peach p-6 mb-4">
                <PlusCircle className="h-10 w-10 text-saboris-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-saboris-gray">Share</h3>
              <p className="text-saboris-gray mb-4 flex-grow">
                Share your favorite spots with friends. No fake reviews, just genuine recommendations from people you trust.
              </p>
              <Button 
                className="mt-auto bg-saboris-primary hover:bg-saboris-primary/90"
                asChild
              >
                <Link to="/add">Share</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center h-full">
              <div className="rounded-full bg-saboris-light p-6 mb-4">
                <MapPin className="h-10 w-10 text-saboris-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-saboris-gray">Explore</h3>
              <p className="text-saboris-gray mb-4 flex-grow">
                Discover new places recommended by your friends. Filter by cuisine, vibe, or rating to find the perfect spot.
              </p>
              <Button 
                className="mt-auto bg-saboris-primary hover:bg-saboris-primary/90"
                asChild
              >
                <Link to="/map">Explore</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center h-full">
              <div className="rounded-full bg-saboris-orange p-6 mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-saboris-gray">Profile</h3>
              <p className="text-saboris-gray mb-4 flex-grow">
                Create your personalized profile, follow friends, and keep track of places you've saved and shared.
              </p>
              <Button 
                className="mt-auto bg-saboris-primary hover:bg-saboris-primary/90"
                asChild
              >
                <Link to="/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
};

export default LandingPage;
