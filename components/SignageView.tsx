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

  // WAKE LOCK
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) { console.error(err); }
    };
    if (isFullscreen) requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, [isFullscreen]);

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
      
      {/* CONTROLS */}
      <div className={`fixed top-6 right-6 z-50 flex gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isFullscreen && (
          <button onClick={onBack} className="bg-gray-100/80 backdrop-blur hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-sm">
            <ArrowLeft size={18} /> Kembali
          </button>
        )}
        <button onClick={toggleFullscreen} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
          <Maximize size={18} /> {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* DESIGN: Blank Putih Minimalist */}
      <div className="max-w-[90vw] w-full flex flex-col items-center justify-center text-center animate-fade-in">
        
        {/* Welcome Text */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.4em] uppercase text-gray-500 mb-12">
          {data.welcomeLabel}
        </h2>

        {/* Separator Line */}
        <div className="w-32 h-[2px] bg-gray-200 mb-12"></div>

        {/* Guest Name */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none text-black mb-10 tracking-tight">
          {data.guestName}
        </h1>

        {/* Instansi */}
        {data.subText && (
            <h3 className="text-2xl md:text-4xl lg:text-5xl text-gray-600 font-medium mt-4">
                {data.subText}
            </h3>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
