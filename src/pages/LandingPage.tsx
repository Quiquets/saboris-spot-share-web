
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  useEffect(() => {
    document.title = 'Saboris - Discover Real Food Recommendations';
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Simple header for landing page */}
      <header className="w-full py-4 px-6 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
            alt="Saboris Logo" 
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold text-saboris-primary">
            Saboris
          </span>
        </Link>
        
        <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-saboris-primary">
          About Us
        </Link>
      </header>
      
      {/* Hero section */}
      <section className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png" 
              alt="Saboris Logo" 
              className="h-24 w-auto"
            />
          </div>
          
          {/* Tagline */}
          <h1 className="text-5xl font-extrabold text-center mb-2">Saboris</h1>
          <p className="text-xl text-center mt-2 mb-8">🍣 Real food. Real friends. Zero BS.</p>
          
          {/* Description */}
          <p className="text-lg text-gray-700 mb-10 max-w-xl mx-auto">
            Discover and share hidden gems with your trusted circle.
            No fake reviews, no ads — just food you'd recommend to your best friend.
          </p>
          
          {/* Call to action */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="bg-saboris-primary hover:bg-saboris-primary/90 text-white px-8 py-6 text-lg flex items-center gap-2"
              asChild
            >
              <Link to="/map">
                Log in or Sign up to explore <ArrowRight className="ml-1" />
              </Link>
            </Button>
            
            <div className="mt-4">
              <a 
                href="https://www.instagram.com/saboris.places/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-saboris-primary transition-colors"
              >
                <Instagram size={18} />
                <span>Follow us on Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Simple footer */}
      <footer className="py-4 px-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Saboris. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
