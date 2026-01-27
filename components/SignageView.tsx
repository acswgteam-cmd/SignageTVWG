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

  // WAKE LOCK (Supaya layar tidak mati otomatis)
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

  // Background Image Style (Jika ada)
  const bgStyle = data.backgroundImage 
    ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : { backgroundColor: '#ffffff' };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center select-none" style={bgStyle}>
      
      {/* Jika ada background image, beri overlay putih tipis supaya teks terbaca */}
      {data.backgroundImage && (
        <div className="absolute inset-0 bg-white/80 z-0"></div>
      )}

      {/* CONTROLS (Muncul saat mouse digerakkan) */}
      <div className={`fixed top-6 right-6 z-50 flex gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isFullscreen && (
          <button onClick={onBack} className="bg-white/90 backdrop-blur hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-md border border-gray-200">
            <ArrowLeft size={18} /> Kembali
          </button>
        )}
        <button onClick={toggleFullscreen} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
          <Maximize size={18} /> {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* CONTENT UTAMA - Layar Putih Minimalis */}
      <div className="relative z-10 max-w-[90vw] w-full flex flex-col items-center justify-center text-center animate-fade-in px-4">
        
        {/* Welcome Text (Bisa diedit Admin) */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.3em] uppercase text-gray-500 mb-8 md:mb-12">
          {data.welcomeLabel || "WELCOME"}
        </h2>

        {/* Separator Line */}
        <div className="w-24 md:w-32 h-[2px] bg-gray-300 mb-8 md:mb-12"></div>

        {/* Nama Tamu (Bisa diedit Admin) */}
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold leading-tight text-gray-900 mb-6 md:mb-10 tracking-tight drop-shadow-sm">
          {data.guestName}
        </h1>

        {/* Nama Instansi (Bisa diedit Admin) */}
        {data.subText && (
            <h3 className="text-xl md:text-3xl lg:text-4xl text-gray-600 font-medium mt-2 md:mt-4 max-w-4xl mx-auto">
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
