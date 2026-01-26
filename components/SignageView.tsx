import React, { useEffect, useState } from 'react';
import { Maximize, ArrowLeft } from 'lucide-react';
import { SignageData } from '../types';
import { SeparatorLine } from './Graphics';

interface SignageViewProps {
  data: SignageData;
  onBack: () => void;
}

export const SignageView: React.FC<SignageViewProps> = ({ data, onBack }) => {
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // WAKE LOCK LOGIC
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        }
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    // Only request wake lock if full screen
    if (isFullscreen) {
      requestWakeLock();
    } else {
       if (wakeLock) {
         wakeLock.release();
         wakeLock = null;
       }
    }

    // Re-request wake lock if visibility changes (e.g. tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isFullscreen) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  // Sync state if user presses Esc
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
        window.removeEventListener('mousemove', handleMove);
        clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden text-white flex flex-col justify-center items-center select-none bg-gray-900">
      
      {/* INTERNAL CONTROLS (Only visible on hover/move) */}
      <div className={`fixed top-6 right-6 z-50 flex gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isFullscreen && (
          <button 
            onClick={onBack}
            className="bg-black/40 hover:bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Admin
          </button>
        )}
        <button 
          onClick={toggleFullscreen}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg transition-all ${isFullscreen ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          <Maximize size={16} /> {isFullscreen ? 'Exit Full Screen' : 'Full Screen (Keep Awake)'}
        </button>
      </div>

      {/* BACKGROUND RENDERING */}
      {data.backgroundImage ? (
        <>
           <div 
             className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700"
             style={{ backgroundImage: `url(${data.backgroundImage})` }}
           />
           <div className="absolute inset-0 z-0 bg-black/30" />
        </>
      ) : (
        // Solid Basic Blue Background
        <div className="absolute inset-0 z-0 bg-blue-600" />
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.2em] uppercase text-white/90 mb-6 text-center drop-shadow-md">
          {data.welcomeLabel}
        </h2>

        <SeparatorLine />

        <div className="max-w-5xl text-center space-y-4 mt-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight drop-shadow-2xl">
            {data.guestName}
            </h1>
            {data.subText && (
                <h3 className="text-xl md:text-3xl text-blue-100 font-medium mt-4 drop-shadow-md">
                    {data.subText}
                </h3>
            )}
        </div>
      </div>
    </div>
  );
};