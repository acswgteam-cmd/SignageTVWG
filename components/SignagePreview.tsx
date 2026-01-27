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
    containerType: 'inline-size', // Enable Container Queries
  };

  const name = data.guest_name || 'Guest Name';
  const sub = data.sub_text || '';

  // Dynamic Font Sizing Logic using CQW (Container Query Width)
  // This ensures text scales relative to the box size, not the screen size.
  // Perfect for thumbnail previews.
  const getNameSize = (text: string, isPortrait: boolean) => {
    const len = text.length;
    if (isPortrait) {
        // Vertical Layout (Base width relative is narrower, so percentages are higher)
        if (len > 80) return 'text-[4cqw] leading-tight';
        if (len > 50) return 'text-[5cqw] leading-snug';
        if (len > 30) return 'text-[7cqw] leading-tight';
        if (len > 15) return 'text-[9cqw] leading-tight';
        return 'text-[11cqw]';
    } else {
        // Landscape Layout
        if (len > 100) return 'text-[2.5cqw] leading-tight';
        if (len > 60) return 'text-[3.5cqw] leading-tight';
        if (len > 30) return 'text-[4.5cqw] leading-tight';
        if (len > 15) return 'text-[6cqw]';
        return 'text-[7cqw]';
    }
  };

  const getSubSize = (text: string, isPortrait: boolean) => {
    const len = text.length;
    if (isPortrait) {
         if (len > 80) return 'text-[2cqw] px-4';
         return 'text-[3.5cqw] px-4';
    } else {
         if (len > 100) return 'text-[1.5cqw]';
         return 'text-[2.5cqw]';
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
      <div className={`relative z-10 w-full max-w-[95cqw] mx-auto flex flex-col items-center justify-center h-full ${isPortrait ? 'py-12' : 'py-8'}`}>
        
        {/* Main Text Content */}
        <div className="text-center flex-grow flex flex-col justify-center w-full max-h-full">
          {/* Welcome Label */}
          <h2 className={`font-light tracking-[0.3em] uppercase opacity-90 drop-shadow-lg shrink-0 ${isPortrait ? 'text-[2.5cqw] mb-[4cqw]' : 'text-[1.8cqw] mb-[2cqw]'}`}>
            {data.welcome_label || 'WELCOME'}
          </h2>
          
          {/* Separator Line */}
          <div className={`bg-white/50 mx-auto rounded-full shadow-sm shrink-0 ${isPortrait ? 'w-[15cqw] h-[0.4cqw] mb-[4cqw]' : 'w-[8cqw] h-[0.3cqw] mb-[3cqw]'}`}></div>
          
          {/* Guest Name - Dynamic Sizing */}
          <h1 className={`font-bold tracking-wide drop-shadow-2xl text-center break-words max-w-[90cqw] mx-auto ${nameSizeClass}`}>
            {name}
          </h1>
          
          {/* Sub Text - Dynamic Sizing */}
          {sub && (
             <h3 className={`font-medium opacity-90 max-w-[80cqw] mx-auto leading-relaxed drop-shadow-lg mt-[1.5cqw] ${subSizeClass}`}>
               {sub}
             </h3>
          )}
        </div>
      </div>
    </div>
  );
};
