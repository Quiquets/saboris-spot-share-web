
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export const SavedPlacesEmpty: React.FC = () => {
  return (
    <div className="text-center py-6 md:py-12 bg-white rounded-lg border border-gray-100">
      <svg xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 md:h-16 md:w-16 text-gray-300 mx-auto mb-3" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h3 className="text-base md:text-xl font-medium mb-2 text-saboris-gray">No saved places found</h3>
      <p className="text-xs md:text-base text-saboris-gray mb-3 md:mb-4">Start exploring and save your favorite restaurants</p>
      <Button asChild className="bg-saboris-primary hover:bg-saboris-primary/90 text-xs md:text-base">
        <Link to="/map">
          <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          Explore Map
        </Link>
      </Button>
    </div>
  );
};
