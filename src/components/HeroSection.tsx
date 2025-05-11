
import { Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-saboris-primary overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[60%] -right-10 w-72 h-72 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-[20%] -left-10 w-96 h-96 bg-white/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          🍣 Real food. Real friends. Zero BS
        </h1>
        <h2 className="text-xl md:text-2xl font-normal text-white/90 mb-10">
          ✨ No fake reviews, just good spots.
        </h2>
        
        <a 
          href="https://www.instagram.com/saboris.places/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300"
        >
          <Instagram size={20} />
          <span>Follow us on Instagram</span>
        </a>
        
        <div className="mt-20 animate-float">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
