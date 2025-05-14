
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const UnauthenticatedState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6 md:py-16">
        <div className="max-w-md mx-auto text-center">
          <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 md:h-16 md:w-16 mx-auto text-gray-300 mb-3 md:mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-12V3m0 0v2m0-2h2M9 3h2m10 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-4 text-saboris-gray">Sign In Required</h1>
          <p className="text-sm md:text-base text-saboris-gray mb-4 md:mb-8">Please sign in to view your saved places.</p>
          <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90 text-sm md:text-base">
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
