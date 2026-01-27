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
      {bgImage && <div className="absolute inset-0 bg-blue-900/40" />}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center justify-between h-full py-12 md:py-24">
        
        {/* Top Logo Area (Placeholder based on image) */}
        <div className="mb-8 md:mb-16">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
            {/* Generic Pegasus/Horse icon placeholder */}
            <svg viewBox="0 0 24 24" className="w-14 h-14 md:w-20 md:h-20 text-blue-800" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
            </svg>
          </div>
        </div>

        {/* Main Text Content */}
        <div className="text-center space-y-4 md:space-y-8 flex-grow flex flex-col justify-center">
          <h2 className="text-2xl md:text-5xl font-light tracking-[0.3em] uppercase opacity-90">
            {data.welcome_label || 'WELCOME'}
          </h2>
          
          <div className="w-24 h-1 bg-white/50 mx-auto my-4 md:my-8 rounded-full"></div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-wide drop-shadow-md">
            {data.guest_name || 'Guest Name'}
          </h1>
          
          {data.sub_text && (
             <h3 className="text-xl md:text-3xl font-medium mt-4 opacity-90 max-w-4xl mx-auto leading-relaxed">
               {data.sub_text}
             </h3>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 md:mt-24 text-center w-full">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs md:text-sm font-semibold tracking-wider uppercase opacity-80 mb-8">
                <span className="px-2">Event <span className="block text-[0.6em] font-normal opacity-70">Management</span></span>
                <span className="h-8 w-px bg-white/40 hidden sm:block"></span>
                <span className="px-2">Travel <span className="block text-[0.6em] font-normal opacity-70">Services</span></span>
                <span className="h-8 w-px bg-white/40 hidden sm:block"></span>
                <span className="px-2">Creative <span className="block text-[0.6em] font-normal opacity-70">Solution</span></span>
                <span className="h-8 w-px bg-white/40 hidden sm:block"></span>
                <span className="px-2">Wellness <span className="block text-[0.6em] font-normal opacity-70">Experiences</span></span>
            </div>

            <div className="inline-block border border-white/30 rounded-full px-6 py-2 bg-blue-900/30 backdrop-blur-sm">
                <p className="text-xs md:text-sm tracking-wide">
                    <span className="font-bold">Werkudara</span> Group | werkudara.com
                </p>
            </div>
        </div>
      </div>

      {/* Background patterns (waves) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-64 opacity-20 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.2) 0%, transparent 60%)'
      }}></div>
    </div>
  );
};