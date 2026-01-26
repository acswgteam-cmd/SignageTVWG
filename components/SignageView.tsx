import React, { useEffect, useState } from 'react';
import { Maximize, ArrowLeft } from 'lucide-react';
import { SignageData } from '../types';

interface SignageViewProps {
  data: SignageData;
  onBack: () => void;
}

export const SignageView: React.FC<SignageViewProps> = ({ data, onBack }) => {
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // WAKE LOCK LOGIC
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isFullscreen) requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, [isFullscreen]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleMove = () => {
      setShowControls(true);
      setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center select-none bg-white">
      
      {/* INTERNAL CONTROLS */}
      <div className={`fixed top-6 right-6 z-50 flex gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isFullscreen && (
          <button onClick={onBack} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-sm border border-gray-300">
            <ArrowLeft size={16} /> Kembali
          </button>
        )}
        <button onClick={toggleFullscreen} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
          <Maximize size={16} /> {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>

      {/* BACKGROUND RENDERING (Optional Image, Default White) */}
      {data.backgroundImage ? (
        <>
           <div 
             className="absolute inset-0 z-0 bg-cover bg-center"
             style={{ backgroundImage: `url(${data.backgroundImage})` }}
           />
           {/* Slight overlay to ensure text readability if user uploads image */}
           <div className="absolute inset-0 z-0 bg-white/50" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-white" />
      )}

      {/* MAIN CONTENT - Minimalist Black Text */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-8 text-center">
        
        {/* Welcome Text */}
        <h2 className="text-2xl md:text-4xl font-light tracking-[0.3em] uppercase text-gray-600 mb-8">
          {data.welcomeLabel}
        </h2>

        {/* Separator Minimalis */}
        <div className="w-20 h-1 bg-gray-300 mb-10"></div>

        {/* Guest Name */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-gray-900 mb-6 drop-shadow-sm">
          {data.guestName}
        </h1>

        {/* Instansi / Subtext */}
        {data.subText && (
            <h3 className="text-2xl md:text-4xl text-gray-700 font-medium mt-4">
                {data.subText}
            </h3>
        )}
      </div>
    </div>
  );
};
