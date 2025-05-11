
import { Instagram } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-12 bg-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[60%] -right-10 w-72 h-72 bg-saboris-primary/10 rounded-full blur-xl"></div>
        <div className="absolute top-[20%] -left-10 w-96 h-96 bg-saboris-primary/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-saboris-primary text-6xl font-extrabold text-center mb-2">Saboris</h1>
        <h2 className="text-saboris-primary text-2xl font-medium text-center mb-4">
          Taste, Share, Explore
        </h2>
        
        {/* Phone mockups displayed horizontally */}
        <div className="mt-10 mb-8 flex justify-center">
          <div className="flex flex-row space-x-4 overflow-x-auto px-4 pb-4">
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
            
            {/* Fourth phone mockup */}
            <div className="flex-shrink-0 relative w-48 h-96 bg-black rounded-3xl border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/c39f7e3b-83f4-4b04-8438-298158de0632.png" 
                  alt="Saboris Profile Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <a 
            href="https://www.instagram.com/saboris.places/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-saboris-primary backdrop-blur-sm rounded-full text-white hover:bg-saboris-primary/90 transition-all duration-300 shadow-lg"
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
