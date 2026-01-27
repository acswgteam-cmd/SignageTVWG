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

  const name = data.guest_name || 'Guest Name';
  const sub = data.sub_text || '';

  // Dynamic Font Sizing Logic
  // We check string length to assign appropriate classes to prevent overflow
  const getNameSize = (text: string, isPortrait: boolean) => {
    const len = text.length;
    if (isPortrait) {
        if (len > 80) return 'text-2xl leading-tight';
        if (len > 50) return 'text-3xl leading-snug';
        if (len > 30) return 'text-4xl leading-tight';
        if (len > 15) return 'text-5xl leading-tight';
        return 'text-6xl md:text-8xl';
    } else {
        if (len > 100) return 'text-3xl leading-tight';
        if (len > 60) return 'text-3xl md:text-5xl leading-tight';
        if (len > 30) return 'text-4xl md:text-6xl leading-tight';
        if (len > 15) return 'text-4xl md:text-7xl';
        return 'text-4xl md:text-7xl lg:text-8xl';
    }
  };

  const getSubSize = (text: string, isPortrait: boolean) => {
    const len = text.length;
    if (isPortrait) {
         if (len > 80) return 'text-sm px-4';
         return 'text-xl md:text-3xl px-4';
    } else {
         if (len > 100) return 'text-lg';
         return 'text-xl md:text-3xl';
    }
  };

  const nameSizeClass = getNameSize(name, isPortrait);
  const subSizeClass = getSubSize(sub, isPortrait);

  return (
    <div 
      className={`relative flex flex-col items-center justify-center text-white overflow-hidden w-full h-full ${className}`}
      style={containerStyle}
    >
      {/* Overlay for better text readability if image is used */}
      {bgImage && <div className="absolute inset-0 bg-black/10" />}

      {/* Content Container */}
      <div className={`relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-full ${isPortrait ? 'px-6 py-12' : 'px-8 py-8'}`}>
        
        {/* Main Text Content */}
        <div className="text-center flex-grow flex flex-col justify-center w-full max-h-full">
          {/* Welcome Label */}
          <h2 className={`font-light tracking-[0.3em] uppercase opacity-90 drop-shadow-lg shrink-0 ${isPortrait ? 'text-2xl mb-6' : 'text-2xl md:text-5xl mb-4 md:mb-8'}`}>
            {data.welcome_label || 'WELCOME'}
          </h2>
          
          {/* Separator Line */}
          <div className={`bg-white/50 mx-auto rounded-full shadow-sm shrink-0 ${isPortrait ? 'w-24 h-1.5 mb-6' : 'w-24 h-1 mb-4 md:mb-8'}`}></div>
          
          {/* Guest Name - Dynamic Sizing */}
          <h1 className={`font-bold tracking-wide drop-shadow-2xl text-center break-words max-w-full ${nameSizeClass}`}>
            {name}
          </h1>
          
          {/* Sub Text - Dynamic Sizing */}
          {sub && (
             <h3 className={`font-medium opacity-90 max-w-5xl mx-auto leading-relaxed drop-shadow-lg mt-4 ${subSizeClass}`}>
               {sub}
             </h3>
          )}
        </div>
      </div>
    </div>
  );
};
