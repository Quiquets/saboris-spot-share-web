
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';

const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Simple header for landing page */}
      <header className="w-full py-4 px-6 md:px-8 bg-saboris-primary flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
            alt="Saboris Logo" 
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold text-white">
            Saboris
          </span>
        </Link>
        
        <Button 
          className="bg-white text-saboris-primary border border-saboris-primary px-4 hover:bg-white hover:text-saboris-primary hover:border-saboris-primary"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <span>Sign In</span>
        </Button>
      </header>
      
      {/* Hero section */}
      <section className="flex-grow flex flex-col md:flex-row items-center">
        {/* Left side - Text */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-black text-saboris-primary leading-tight">
            Share Spots.<br />Trust Friends.
          </h1>
          <p className="mt-4 text-lg max-w-lg text-gray-700">
            Discover local food gems through personal recommendations from people you actually know. No fake reviews. No algorithms. Just real spots, shared by real friends.
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-saboris-primary hover:bg-saboris-primary/90 text-white px-8 py-6 text-lg"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <span>Get Started</span>
            </Button>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="w-full md:w-1/2 p-8 bg-saboris-light flex justify-center items-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Food collage elements - stylized with shadows and rotations */}
            <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-white rounded-2xl shadow-lg transform -rotate-6 flex items-center justify-center text-4xl">
              🍣
            </div>
            <div className="absolute top-[25%] right-[10%] w-36 h-36 bg-white rounded-2xl shadow-lg transform rotate-3 flex items-center justify-center text-4xl">
              🌮
            </div>
            <div className="absolute bottom-[15%] left-[20%] w-28 h-28 bg-white rounded-2xl shadow-lg transform rotate-6 flex items-center justify-center text-4xl">
              ☕
            </div>
            <div className="absolute bottom-[25%] right-[15%] w-32 h-32 bg-white rounded-2xl shadow-lg transform -rotate-3 flex items-center justify-center text-4xl">
              🍜
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/lovable-uploads/8fa264ad-59c9-42a1-89b0-eefa3d3d2bbf.png" 
                alt="Saboris" 
                className="w-24 h-24 rounded-full shadow-xl bg-white p-3"
              />
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
