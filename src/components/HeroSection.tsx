
import { Instagram, Coffee, Pizza, Sandwich, IceCream } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-12 bg-saboris-primary overflow-hidden">
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
        <h2 className="text-white text-2xl font-medium text-center mb-4">
          🍣 Real food. Real friends. Zero BS.
        </h2>
        
        {/* Food emojis */}
        <div className="text-white text-3xl text-center mt-4 mb-8">
          🍣 🌮 🍜 ☕ 🥐 🍕 🥟 🍦 🍔
        </div>
        
        <div className="mt-4">
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
      </div>
      
      {/* Speech bubble tail - updated to saboris-primary (coral pink) */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-saboris-primary border-r-[20px] border-r-transparent"></div>
    </section>
  );
};

export default HeroSection;
