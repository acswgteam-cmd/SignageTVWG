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

  // Remove default fallbacks so they can be hidden if empty
  const name = data.guest_name;
  const sub = data.sub_text;
  const welcome = data.welcome_label;

  // Dynamic Font Sizing Logic using CQW (Container Query Width)
  const getNameSize = (text: string, isPortrait: boolean) => {
    const len = text.length;
    if (isPortrait) {
        // Vertical Layout
        if (len > 80) return 'text-[4cqw] leading-tight';
        if (len > 50) return 'text-[5cqw] leading-snug';
        if (len > 30) return 'text-[7cqw] leading-tight';
        if (len > 15) return 'text-[9cqw] leading-tight';
        return 'text-[11cqw]';
    } else {
        // Landscape Layout
        if (len > 100) return 'text-[2.5cqw] leading-tight';
        if (len > 60) return 'text-[3.5cqw] leading-tight';
        if (len > 30) return 'text-[5cqw] leading-tight';
        if (len > 15) return 'text-[6.5cqw]';
        return 'text-[8cqw]';
    }
  };

  const getSubSize = (text: string, isPortrait: boolean) => {
    const len = text.length;
    if (isPortrait) {
         if (len > 80) return 'text-[2.5cqw] px-4';
         return 'text-[4cqw] px-4';
    } else {
         if (len > 100) return 'text-[2cqw]';
         return 'text-[3cqw]';
    }
  };

  const nameSizeClass = name ? getNameSize(name, isPortrait) : '';
  const subSizeClass = sub ? getSubSize(sub, isPortrait) : '';

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
          {/* Welcome Label - Conditional Render */}
          {welcome && (
            <h2 className={`font-light tracking-[0.3em] uppercase opacity-90 drop-shadow-lg shrink-0 ${isPortrait ? 'text-[4cqw] mb-[3cqw]' : 'text-[3cqw] mb-[2cqw]'}`}>
                {welcome}
            </h2>
          )}
          
          {/* Guest Name - Conditional Render */}
          {name && (
            <h1 className={`font-bold tracking-wide drop-shadow-2xl text-center break-words max-w-[90cqw] mx-auto ${nameSizeClass}`}>
                {name}
            </h1>
          )}
          
          {/* Sub Text - Conditional Render */}
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
