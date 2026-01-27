import React from 'react';
import { Signage } from '../types';

interface SignagePreviewProps {
  data: Partial<Signage>;
  className?: string;
  fullScreen?: boolean;
}

export const SignagePreview: React.FC<SignagePreviewProps> = ({ data, className = '', fullScreen = false }) => {
  const bgImage = data.background_image || '';
  const isPortrait = data.layout === 'portrait';
  
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
      {bgImage && <div className="absolute inset-0 bg-black/10" />}

      {/* Content Container */}
      {/* If Portrait, we add more vertical padding and ensure width is constrained properly */}
      <div className={`relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-full ${isPortrait ? 'px-6 py-20' : 'px-8'}`}>
        
        {/* Main Text Content */}
        <div className="text-center flex-grow flex flex-col justify-center">
          <h2 className={`font-light tracking-[0.3em] uppercase opacity-90 drop-shadow-lg ${isPortrait ? 'text-4xl mb-8' : 'text-2xl md:text-5xl mb-4 md:mb-8'}`}>
            {data.welcome_label || 'WELCOME'}
          </h2>
          
          <div className={`bg-white/50 mx-auto rounded-full shadow-sm ${isPortrait ? 'w-32 h-2 my-8' : 'w-24 h-1 my-4 md:my-8'}`}></div>
          
          <h1 className={`font-bold tracking-wide drop-shadow-2xl leading-tight ${isPortrait ? 'text-6xl md:text-8xl py-4' : 'text-4xl md:text-7xl lg:text-8xl'}`}>
            {data.guest_name || 'Guest Name'}
          </h1>
          
          {data.sub_text && (
             <h3 className={`font-medium opacity-90 max-w-4xl mx-auto leading-relaxed drop-shadow-lg ${isPortrait ? 'text-3xl mt-12 px-4' : 'text-xl md:text-3xl mt-4'}`}>
               {data.sub_text}
             </h3>
          )}
        </div>
      </div>
    </div>
  );
};
