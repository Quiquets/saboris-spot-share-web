
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
      <section className="py-10 sm:py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-saboris-primary mb-6 sm:mb-8">Features</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center h-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full bg-saboris-peach p-5 mb-3 sm:mb-4">
                <PlusCircle className="h-8 w-8 sm:h-10 sm:w-10 text-saboris-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-saboris-gray">Share</h3>
              <p className="text-saboris-gray mb-4 flex-grow text-sm sm:text-base">
                Share real recommendations from friends — no fake reviews, just trusted picks.
              </p>
              <Button 
                className="mt-auto bg-saboris-primary hover:bg-saboris-primary/90 text-sm h-9"
                asChild
              >
                <Link to="/add">Share</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center h-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full bg-saboris-light p-5 mb-3 sm:mb-4">
                <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-saboris-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-saboris-gray">Explore</h3>
              <p className="text-saboris-gray mb-4 flex-grow text-sm sm:text-base">
                Discover new places recommended by your friends – filter by cuisine, vibe, or rating to find the perfect spot.
              </p>
              <Button 
                className="mt-auto bg-saboris-primary hover:bg-saboris-primary/90 text-sm h-9"
                asChild
              >
                <Link to="/map">Explore</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center h-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full bg-saboris-orange p-5 mb-3 sm:mb-4">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-saboris-gray">Profile</h3>
              <p className="text-saboris-gray mb-4 flex-grow text-sm sm:text-base">
                Create your personalized profile – follow friends and keep track of places you've saved and shared.
              </p>
              <Button 
                className="mt-auto bg-saboris-primary hover:bg-saboris-primary/90 text-sm h-9"
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
