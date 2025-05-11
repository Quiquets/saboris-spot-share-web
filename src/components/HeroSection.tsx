
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
          Taste, Share, Explore
        </h2>
        
        {/* Phone mockups displayed horizontally */}
        <div className="mt-10 mb-8 flex justify-center">
          <div className="flex flex-row space-x-4 overflow-x-auto pb-4 max-w-full">
            {/* First phone mockup */}
            <div className="flex-shrink-0 relative w-48 h-96 bg-black rounded-3xl border-8 border-black shadow-xl">
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
            <div className="flex-shrink-0 relative w-48 h-96 bg-black rounded-3xl border-8 border-black shadow-xl">
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
            <div className="flex-shrink-0 relative w-48 h-96 bg-black rounded-3xl border-8 border-black shadow-xl">
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
        
        <div className="mt-6">
          <div className="flex justify-center space-x-3 items-center text-white text-sm">
            <span>Soon available on:</span>
            <img src="/lovable-uploads/98b50480-0977-43cf-a8ab-5ea982dcca4b.png" alt="App Store and Google Play" className="h-8" />
          </div>
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
    </section>
  );
};

export default HeroSection;
