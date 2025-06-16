
import React from 'react';

interface MapLoadingProps {
  className?: string;
}

export const MapLoading: React.FC<MapLoadingProps> = ({ className = "h-full w-full" }) => {
  return (
    <div className={`${className} flex items-center justify-center bg-gray-100`}>
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full border-4 border-saboris-primary border-t-transparent animate-spin"></div>
        <p className="mt-2 text-saboris-gray">Loading map...</p>
      </div>
    </div>
  );
};
