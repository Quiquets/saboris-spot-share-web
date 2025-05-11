
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { MapPin, PlusCircle, User } from 'lucide-react';

const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Include Header for consistency across all pages */}
      <Header />
      
      {/* Hero section - Updated to all white */}
      <section className="flex-grow flex flex-col md:flex-row items-stretch">
        {/* Left side - Text */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <h1 className="text-6xl font-black leading-tight">
            Share spots.<br />Trust friends.
          </h1>
          <ul className="mt-6 space-y-3 text-lg">
            {['Discover local food gems', 'No fake reviews', 'Just real spots'].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 mt-1 bg-saboris-primary rounded-full flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/494f1510-61a8-4b13-96ec-985e5bad6e0d.png" 
                    alt="Saboris Icon" 
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <span className="ml-3">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-saboris-primary hover:bg-saboris-primary/90 text-white border border-saboris-primary px-8 py-6 text-lg"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <span>Get Started</span>
            </Button>
          </div>
        </div>

        {/* Right side - White background with Phone Mockups */}
        <div className="w-full md:w-1/2 p-8 bg-white flex flex-col items-center justify-center">
          {/* Vertically aligned phone mockups */}
          <div className="flex flex-col space-y-6 max-w-full justify-center">
            {/* First phone mockup */}
            <div className="flex-shrink-0 relative w-44 h-88 bg-black rounded-3xl border-8 border-black shadow-xl mx-auto">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/f50f3cf4-3812-4e99-9560-147fd0e748b9.png" 
                  alt="Saboris App Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Second phone mockup */}
            <div className="flex-shrink-0 relative w-44 h-88 bg-black rounded-3xl border-8 border-black shadow-xl mx-auto">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/7f8c4ae2-dcfb-475a-a590-cdde712f4fc0.png" 
                  alt="Saboris Map Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Third phone mockup */}
            <div className="flex-shrink-0 relative w-44 h-88 bg-black rounded-3xl border-8 border-black shadow-xl mx-auto">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/b5d4f98b-2f75-4fd2-a36a-bd9a11fe677d.png" 
                  alt="Saboris Reviews Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Cards Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-saboris-primary mb-8">Taste, Share, Explore</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-saboris-peach p-4 mb-4 text-white">
                  <PlusCircle className="h-8 w-8 text-saboris-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share</h3>
                <p className="text-gray-600">
                  Share your favorite spots with friends. No fake reviews, just genuine recommendations from people you trust.
                </p>
                <Button 
                  className="mt-6 bg-saboris-primary hover:bg-saboris-primary/90"
                  asChild
                >
                  <Link to="/add">Share Places</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-saboris-light p-4 mb-4 text-saboris-primary">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Explore</h3>
                <p className="text-gray-600">
                  Discover new places recommended by your friends. Filter by cuisine, vibe, or rating to find the perfect spot.
                </p>
                <Button 
                  className="mt-6 bg-saboris-primary hover:bg-saboris-primary/90"
                  asChild
                >
                  <Link to="/map">View Map</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-saboris-orange p-4 mb-4 text-white">
                  <User className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Profile</h3>
                <p className="text-gray-600">
                  Create your personalized profile, follow friends, and keep track of places you've saved and shared.
                </p>
                <Button 
                  className="mt-6 bg-saboris-primary hover:bg-saboris-primary/90"
                  asChild
                >
                  <Link to="/profile">View Profile</Link>
                </Button>
              </CardContent>
            </Card>
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
