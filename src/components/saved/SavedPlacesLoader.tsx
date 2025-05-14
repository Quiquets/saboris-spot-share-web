
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SavedPlacesLoaderProps {
  inline?: boolean;
}

export const SavedPlacesLoader: React.FC<SavedPlacesLoaderProps> = ({ inline = false }) => {
  if (inline) {
    return (
      <div className="text-center py-6 md:py-12">
        <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-4 border-t-saboris-primary border-gray-200 mx-auto mb-3"></div>
        <p className="text-sm md:text-base text-saboris-gray">Loading your saved places...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="h-8 w-8 md:h-12 md:w-12 animate-spin rounded-full border-4 border-t-saboris-primary border-gray-200"></div>
      </div>
      <Footer />
    </div>
  );
};
