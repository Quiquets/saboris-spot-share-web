
import { Instagram, Coffee, Pizza, Sandwich, IceCream } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 bg-saboris-primary overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[60%] -right-10 w-72 h-72 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-[20%] -left-10 w-96 h-96 bg-white/10 rounded-full blur-xl"></div>
        
        {/* Food-themed icons as background elements */}
        <Coffee className="absolute top-[15%] right-[15%] text-white/20 w-16 h-16" />
        <Pizza className="absolute bottom-[20%] left-[10%] text-white/20 w-20 h-20" />
        <Sandwich className="absolute top-[30%] left-[15%] text-white/20 w-14 h-14" />
        <IceCream className="absolute bottom-[25%] right-[20%] text-white/20 w-16 h-16" />
      </div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-white text-6xl font-extrabold text-center mb-2">Saboris</h1>
        <h2 className="text-white text-2xl font-medium text-center">
          🍣 Real food. Real friends. Zero BS.
        </h2>
        
        <div className="mt-8">
          <a 
            href="https://www.instagram.com/saboris.places/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
          >
            <Instagram size={20} />
            <span>Follow us on Instagram</span>
          </a>
        </div>
        
        <div className="mt-14 animate-float">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
