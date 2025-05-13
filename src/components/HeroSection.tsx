
import { Instagram } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection = () => {
  // Ref for the scrolling text container
  const scrollTextRef = useRef<HTMLDivElement>(null);
  // State to track if the content is ready to animate
  const [isReady, setIsReady] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const isMobile = useIsMobile();

  // Effect to handle scrolling animation
  useEffect(() => {
    const textElement = scrollTextRef.current;
    if (!textElement) return;
    
    // Calculate how many repetitions we need to fill the container
    const calculateInitialContent = () => {
      const containerWidth = textElement.parentElement?.offsetWidth || 0;
      const itemWidth = textElement.children[0]?.getBoundingClientRect().width || 0;
      
      if (containerWidth > 0 && itemWidth > 0) {
        // Make sure we're already filled with text before starting animation
        setIsReady(true);
      }
    };
    
    // Run calculation after a small delay to ensure DOM is ready
    const timer = setTimeout(calculateInitialContent, 100);
    
    const scrollSpeed = 0.5; // Reduced scrolling speed for better performance
    let animationFrameId: number;
    let scrollPosition = 0;
    
    const scrollText = () => {
      if (!textElement || !isReady) return;
      
      scrollPosition += scrollSpeed;
      
      // Reset position when text has scrolled completely
      const firstItemWidth = textElement.children[0]?.getBoundingClientRect().width || 0;
      if (scrollPosition > firstItemWidth) {
        scrollPosition = 0;
      }
      
      textElement.style.transform = `translateX(-${scrollPosition}px)`;
      animationFrameId = requestAnimationFrame(scrollText);
    };
    
    // Only start animation if content is ready
    if (isReady) {
      animationFrameId = requestAnimationFrame(scrollText);
    }
    
    return () => {
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isReady]);

  // Preload images for better performance
  useEffect(() => {
    const imagePaths = [
      "/lovable-uploads/f50f3cf4-3812-4e99-9560-147fd0e748b9.png",
      "/lovable-uploads/9d766b36-b56c-4ebf-987c-0ad7c250fe95.png",
      "/lovable-uploads/f685ee6d-d291-411d-a8f5-6765d1be4ae9.png",
      "/lovable-uploads/a32b5be2-a042-4f1c-805c-6d596e8e22c6.png",
      "/lovable-uploads/c39f7e3b-83f4-4b04-8438-298158de0632.png"
    ];
    
    let loadedCount = 0;
    
    imagePaths.forEach(path => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagePaths.length) {
          setImagesLoaded(true);
        }
      };
      img.src = path;
    });
    
    // If images take too long, proceed anyway
    const timer = setTimeout(() => {
      setImagesLoaded(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center px-0 py-8 sm:py-12 bg-white overflow-hidden w-full">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[60%] -right-10 w-72 h-72 bg-saboris-primary/10 rounded-full blur-xl"></div>
        <div className="absolute top-[20%] -left-10 w-96 h-96 bg-saboris-primary/10 rounded-full blur-xl"></div>
        
        {/* Coral pink horizontal line across the middle */}
        <div className="absolute left-0 right-0 h-16 md:h-24 top-1/2 -translate-y-1/2 bg-[#FFDEE2] z-0">
          {/* Scrolling text banner - centered within the pink background */}
          <div className="relative w-full h-full overflow-hidden">
            <div 
              ref={scrollTextRef}
              className={`whitespace-nowrap text-white font-bold text-sm md:text-xl absolute top-1/2 left-0 -translate-y-1/2 flex ${!isReady ? 'opacity-0' : 'opacity-100'} transition-opacity`}
              style={{ willChange: 'transform' }} // Optimize for animation performance
            >
              {/* Repeat the text enough times to fill the container initially */}
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="px-2 md:px-4">
                  APP COMING SOON
                  <span className="inline-block mx-2 md:mx-4">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 text-center w-full mx-auto">
        <h1 className="text-saboris-primary text-4xl md:text-6xl font-extrabold text-center mb-2">Saboris</h1>
        <h2 className="text-saboris-gray text-lg md:text-2xl font-medium text-center mb-4">
          Taste, Share, Explore
        </h2>
        
        {/* Phone mockups with horizontal scrolling for mobile */}
        <div className="mt-6 mb-8 w-full relative z-10">
          {/* Swipe indication for mobile */}
          {isMobile && imagesLoaded && (
            <div className="flex items-center justify-center gap-2 mb-3 text-saboris-gray">
              <span className="text-sm font-medium">Scroll horizontally to see more</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          )}
          <div className={`overflow-x-auto pb-4 hide-scrollbar ${!imagesLoaded && 'min-h-[200px]'}`}>
            {imagesLoaded ? (
              <div className="flex justify-start md:justify-center gap-2 md:gap-4 lg:gap-8 px-2 md:px-4 min-w-max">
                {/* Responsive phone mockups - better alignment and styling */}
                {[
                  "/lovable-uploads/f50f3cf4-3812-4e99-9560-147fd0e748b9.png",
                  "/lovable-uploads/9d766b36-b56c-4ebf-987c-0ad7c250fe95.png",
                  "/lovable-uploads/f685ee6d-d291-411d-a8f5-6765d1be4ae9.png",
                  "/lovable-uploads/a32b5be2-a042-4f1c-805c-6d596e8e22c6.png",
                  "/lovable-uploads/c39f7e3b-83f4-4b04-8438-298158de0632.png"
                ].map((src, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    {/* Phone mockup with proper dimensions */}
                    <div className={`${isMobile ? 'w-[180px] h-[360px]' : 'w-[200px] h-[400px] md:w-[220px] md:h-[440px] lg:w-[240px] lg:h-[480px]'} relative`}>
                      {/* Phone frame */}
                      <div className="absolute inset-0 bg-black rounded-[36px] shadow-xl">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[3%] bg-black rounded-b-xl"></div>
                        
                        {/* Screen with rounded corners */}
                        <div className="absolute inset-[2px] rounded-[34px] overflow-hidden">
                          <img 
                            src={src}
                            alt={`Saboris App Screenshot ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-pulse h-6 w-6 rounded-full bg-saboris-primary"></div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <a 
            href="https://www.instagram.com/saboris.places/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 bg-saboris-primary backdrop-blur-sm rounded-full text-white text-sm md:text-base hover:bg-saboris-primary/90 transition-all duration-300 shadow-lg"
          >
            <Instagram size={16} className="md:size-[20px]" />
            <span>Follow us on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
