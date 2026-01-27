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

  // WAKE LOCK: Mencegah layar mati saat mode signage aktif
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) { console.error('Wake Lock failed:', err); }
    };
    if (isFullscreen) requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, [isFullscreen]);

  // Fullscreen Handler
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) { console.error(e); }
  };

  // Mouse movement handler untuk menampilkan tombol kontrol sementara
  useEffect(() => {
    let timeout: any;
    const handleMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('click', handleMove); // Support touch/click
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('click', handleMove);
      clearTimeout(timeout);
    };
  }, []);

  // Background Logic
  const bgStyle = data.backgroundImage 
    ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : { backgroundColor: '#ffffff' };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center select-none bg-white text-black" style={bgStyle}>
      
      {/* Overlay Putih jika ada background image, agar teks tetap terbaca jelas */}
      {data.backgroundImage && (
        <div className="absolute inset-0 bg-white/90 z-0"></div>
      )}

      {/* CONTROLS UI (Tersembunyi otomatis) */}
      <div className={`fixed top-6 right-6 z-50 flex gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isFullscreen && (
          <button onClick={onBack} className="bg-white/90 hover:bg-gray-100 text-gray-800 px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold tracking-wider transition-all shadow-sm border border-gray-200 uppercase">
            <ArrowLeft size={16} /> Admin Panel
          </button>
        )}
        <button onClick={toggleFullscreen} className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold tracking-wider shadow-lg transition-all uppercase">
          <Maximize size={16} /> {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 w-full max-w-[90vw] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-1000 slide-in-from-bottom-10">
        
        {/* 1. WELCOME TEXT (Header) - Kecil, Spasi Lebar */}
        <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-medium tracking-[0.5em] text-gray-400 uppercase">
            {data.welcomeLabel || "WELCOME"}
            </h2>
        </div>

        {/* Separator Line */}
        <div className="w-[1px] h-16 bg-gray-300 mb-8 md:mb-12"></div>

        {/* 2. GUEST NAME (Utama) - Besar, Bold */}
        <div className="mb-6 md:mb-10 max-w-5xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            {data.guestName || "Nama Tamu"}
            </h1>
        </div>

        {/* 3. INSTANSI / SUBTEXT - Abu-abu, Medium */}
        {data.subText && (
            <div className="mt-4 md:mt-8 max-w-4xl border-t border-gray-200 pt-8 md:pt-10 px-8">
                <h3 className="text-xl md:text-3xl text-gray-500 font-normal leading-relaxed">
                    {data.subText}
                </h3>
            </div>
        )}

      </div>
    </div>
  );
};
