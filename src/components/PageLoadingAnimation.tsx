
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Show loading animation for 400ms
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    
    return () => clearTimeout(timer);
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
          className="h-16 w-auto animate-pulse"
        />
        <span className="mt-3 text-xl font-bold text-white">
          Saboris
        </span>
      </div>
    </div>
  );
};

export default PageLoadingAnimation;
