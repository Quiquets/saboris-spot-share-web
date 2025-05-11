
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
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-saboris-primary text-white">
          <h1 className="text-white text-6xl font-black leading-tight">
            🍽️ Share spots.<br />🧑‍🤝‍🧑 Trust friends.
          </h1>
          <p className="text-white mt-4 text-lg max-w-xl">
            🍜 Discover local food gems through personal recommendations from people you actually know.<br />
            ❌ No fake reviews. 🤖 No algorithms.<br />
            ✅ Just real spots, shared by real friends.
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-white hover:bg-white/90 text-saboris-primary border border-white px-8 py-6 text-lg"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <span>Get Started</span>
            </Button>
          </div>
          <p className="text-white text-sm mt-8 font-medium">
            🛠️ <em>Saboris App coming soon</em>
          </p>
        </div>

        {/* Right side - Phone Mockups */}
        <div className="w-full md:w-1/2 p-8 bg-saboris-light flex justify-center items-center">
          <div className="relative flex space-x-12">
            {/* First phone mockup */}
            <div className="relative w-48 h-96 bg-black rounded-3xl border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden">
                {/* Placeholder for future image */}
                <div className="h-full w-full flex items-center justify-center bg-gray-300">
                  <p className="text-gray-500 text-sm">Screenshot 1</p>
                </div>
              </div>
            </div>
            
            {/* Second phone mockup */}
            <div className="relative w-48 h-96 bg-black rounded-3xl border-8 border-black shadow-xl hidden md:block">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden">
                {/* Placeholder for future image */}
                <div className="h-full w-full flex items-center justify-center bg-gray-300">
                  <p className="text-gray-500 text-sm">Screenshot 2</p>
                </div>
              </div>
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
