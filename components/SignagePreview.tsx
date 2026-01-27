import React from 'react';
import { Signage } from '../types';

interface SignagePreviewProps {
  data: Partial<Signage>;
  className?: string;
  fullScreen?: boolean;
}

export const SignagePreview: React.FC<SignagePreviewProps> = ({ data, className = '', fullScreen = false }) => {
  const bgImage = data.background_image || '';
  
  // Base style for the Werkudara theme
  const containerStyle: React.CSSProperties = {
    backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(135deg, #0044cc 0%, #001133 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center text-white overflow-hidden w-full h-full ${className}`}
      style={containerStyle}
    >
      {/* Overlay for better text readability if image is used */}
      {/* Reduced opacity slightly since user will use designed backgrounds */}
      {bgImage && <div className="absolute inset-0 bg-black/10" />}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center justify-center h-full">
        
        {/* Main Text Content */}
        <div className="text-center space-y-4 md:space-y-8 flex-grow flex flex-col justify-center">
          <h2 className="text-2xl md:text-5xl font-light tracking-[0.3em] uppercase opacity-90 drop-shadow-lg">
            {data.welcome_label || 'WELCOME'}
          </h2>
          
          <div className="w-24 h-1 bg-white/50 mx-auto my-4 md:my-8 rounded-full shadow-sm"></div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-wide drop-shadow-2xl">
            {data.guest_name || 'Guest Name'}
          </h1>
          
          {data.sub_text && (
             <h3 className="text-xl md:text-3xl font-medium mt-4 opacity-90 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
               {data.sub_text}
             </h3>
          )}
        </div>
      </div>
    </div>
  );
};
