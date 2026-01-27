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
        <div className="absolute inset-0 bg-white/85 z-0"></div>
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

      {/* CONTENT UTAMA - Design Professional */}
      <div className="relative z-10 max-w-[95vw] w-full flex flex-col items-center justify-center text-center animate-fade-in px-4">
        
        {/* Welcome Text (Static/Editable) */}
        <h2 className="text-xl md:text-2xl lg:text-3xl font-medium tracking-[0.4em] uppercase text-gray-500 mb-10 md:mb-16">
          {data.welcomeLabel || "SELAMAT DATANG"}
        </h2>

        {/* Separator Elegant */}
        <div className="w-[2px] h-16 md:h-24 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 mb-10 md:mb-16"></div>

        {/* Nama Tamu (Fokus Utama) */}
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold leading-[1.1] text-gray-900 mb-8 md:mb-12 tracking-tight drop-shadow-sm max-w-6xl">
          {data.guestName}
        </h1>

        {/* Nama Instansi (Subtext) */}
        {data.subText && (
            <h3 className="text-lg md:text-2xl lg:text-4xl text-gray-600 font-normal mt-2 md:mt-4 max-w-4xl mx-auto border-t border-gray-300 pt-8 md:pt-12 px-12">
                {data.subText}
            </h3>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};
