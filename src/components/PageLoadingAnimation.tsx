
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PageLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const timerRef = useRef<number>();
  
  useEffect(() => {
    // Show loading animation for 400ms
    setIsLoading(true);
    
    // Use ref to store timeout ID for proper cleanup
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 400);
    
    return () => {
      // Clear timeout when component unmounts or route changes
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname]);
  
  if (!isLoading) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-saboris-primary transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <img
          src="/lovable-uploads/b7b8b076-5e15-4c2b-92c0-ada36bc99a6f.png"
          alt="Saboris Logo"
          className="h-16 w-auto animate-bounce"
        />
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default PageLoadingAnimation;
