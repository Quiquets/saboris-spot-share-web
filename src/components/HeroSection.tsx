
import { Instagram } from 'lucide-react';
import { useEffect, useRef } from 'react';

const HeroSection = () => {
  // Ref for the scrolling text container
  const scrollTextRef = useRef<HTMLDivElement>(null);

  // Effect to handle scrolling animation
  useEffect(() => {
    const textElement = scrollTextRef.current;
    if (!textElement) return;
    
    const scrollSpeed = 1; // Controls the scrolling speed
    let animationFrameId: number;
    let scrollPosition = 0;
    
    const scrollText = () => {
      if (!textElement) return;
      
      scrollPosition += scrollSpeed;
      
      // Reset position when text has scrolled completely
      if (scrollPosition > textElement.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      textElement.style.transform = `translateX(-${scrollPosition}px)`;
      animationFrameId = requestAnimationFrame(scrollText);
    };
    
    animationFrameId = requestAnimationFrame(scrollText);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center px-0 py-12 bg-white overflow-hidden w-full">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[60%] -right-10 w-72 h-72 bg-saboris-primary/10 rounded-full blur-xl"></div>
        <div className="absolute top-[20%] -left-10 w-96 h-96 bg-saboris-primary/10 rounded-full blur-xl"></div>
        
        {/* Coral pink horizontal line across the middle */}
        <div className="absolute left-0 right-0 h-24 top-1/2 -translate-y-1/2 bg-[#FFDEE2] z-0">
          {/* Scrolling text banner - moved inside the pink background */}
          <div className="relative w-full h-full overflow-hidden">
            <div 
              ref={scrollTextRef}
              className="whitespace-nowrap text-white font-bold text-xl absolute top-1/2 -translate-y-1/2"
              style={{ width: 'fit-content', display: 'flex' }}
            >
              {/* Repeat the text multiple times to create continuous scroll effect */}
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="px-4">
                  APP COMING SOON
                  <span className="inline-block mx-4">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 text-center w-full mx-auto">
        <h1 className="text-saboris-primary text-6xl font-extrabold text-center mb-2">Saboris</h1>
        <h2 className="text-saboris-gray text-2xl font-medium text-center mb-4">
          Taste, Share, Explore
        </h2>
        
        {/* Phone mockups displayed horizontally across full width */}
        <div className="mt-6 mb-8 w-full relative z-10">
          <div className="flex justify-center items-center gap-2 md:gap-4 lg:gap-8 px-2 md:px-4 max-w-[100vw] overflow-hidden">
            {/* First phone mockup */}
            <div className="relative w-20 md:w-40 lg:w-48 h-40 md:h-80 lg:h-96 bg-black rounded-3xl border-4 md:border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-2 md:h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/f50f3cf4-3812-4e99-9560-147fd0e748b9.png" 
                  alt="Saboris App Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Second phone mockup */}
            <div className="relative w-20 md:w-40 lg:w-48 h-40 md:h-80 lg:h-96 bg-black rounded-3xl border-4 md:border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-2 md:h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/9d766b36-b56c-4ebf-987c-0ad7c250fe95.png" 
                  alt="Saboris Map Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* NEW phone mockup - Added between second and third */}
            <div className="relative w-20 md:w-40 lg:w-48 h-40 md:h-80 lg:h-96 bg-black rounded-3xl border-4 md:border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-2 md:h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/f685ee6d-d291-411d-a8f5-6765d1be4ae9.png" 
                  alt="Saboris Map Explore Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Third phone mockup - Updated with the user-provided image */}
            <div className="relative w-20 md:w-40 lg:w-48 h-40 md:h-80 lg:h-96 bg-black rounded-3xl border-4 md:border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-2 md:h-5 bg-black rounded-b-xl"></div>
              <div className="w-full h-full bg-gray-200 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <img 
                  src="/lovable-uploads/a32b5be2-a042-4f1c-805c-6d596e8e22c6.png" 
                  alt="Saboris Reviews Screenshot" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Fourth phone mockup */}
            <div className="relative w-20 md:w-40 lg:w-48 h-40 md:h-80 lg:h-96 bg-black rounded-3xl border-4 md:border-8 border-black shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-2 md:h-5 bg-black rounded-b-xl"></div>
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
