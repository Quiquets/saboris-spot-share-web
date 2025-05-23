
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PageLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const location = useLocation();
  const timerRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Show loading animation immediately when route changes
    setIsLoading(true);
    setIsFading(false);
    
    // Start fading out after a short delay
    timerRef.current = setTimeout(() => {
      setIsFading(true);
      
      // Hide completely after fade animation completes
      timerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Match this to the CSS transition duration
    }, 300); // Reduced from 400ms to 300ms for faster loading
    
    return () => {
      // Clear all timeouts when component unmounts or route changes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname]);
  
  if (!isLoading) {
    return null;
  }
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-saboris-primary transition-opacity duration-300 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      style={{ willChange: 'opacity' }} // Optimize for animation performance
    >
      <div className="flex flex-col items-center">
        <img
          src="/lovable-uploads/494f1510-61a8-4b13-96ec-985e5bad6e0d.png"
          alt="Saboris Logo"
          className="h-16 w-auto animate-bounce"
          loading="eager"
        />
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default PageLoadingAnimation;
