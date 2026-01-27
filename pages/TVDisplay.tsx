import React, { useEffect, useState, useRef } from 'react';
import { signageService } from '../services/supabase';
import { Signage } from '../types';
import { SignagePreview } from '../components/SignagePreview';
import { Loader2, MonitorOff, Maximize2 } from 'lucide-react';

export const TVDisplay: React.FC = () => {
  const [signages, setSignages] = useState<Signage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  
  // Settings for slideshow
  const ROTATION_INTERVAL = 15000; // 15 seconds per slide

  useEffect(() => {
    // 1. Fetch Data
    const initData = async () => {
      try {
        const data = await signageService.getAll();
        // Filter only active signages for TV
        // If is_active is undefined, assume true for backward compatibility
        const activeData = data.filter(s => s.is_active !== false);
        setSignages(activeData);
      } catch (err) {
        console.error(err);
        setError("Failed to load content from database.");
      } finally {
        setLoading(false);
      }
    };

    initData();

    // 2. Request Wake Lock
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
          console.log('Wake Lock is active');
          
          lock.addEventListener('release', () => {
            console.log('Wake Lock released');
            setWakeLock(null);
          });
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    requestWakeLock();

    // Re-acquire lock if visibility changes (e.g. switching tabs and coming back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // 3. Slideshow Logic
  useEffect(() => {
    if (signages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % signages.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [signages]);

  // Fullscreen Helper
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-blue-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-mono text-sm tracking-widest uppercase">Loading System...</p>
      </div>
    );
  }

  if (error || signages.length === 0) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-gray-500 p-8 text-center">
        <MonitorOff size={64} className="mb-6 opacity-50" />
        <h1 className="text-2xl font-bold mb-2 text-white">No Active Content</h1>
        <p>{error || "No items are marked as 'Show on TV' in the dashboard."}</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-2 border border-gray-700 rounded hover:bg-gray-900 transition-colors"
        >
            Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden cursor-none hover:cursor-default">
       {/* Content */}
       <SignagePreview 
          data={signages[currentIndex]} 
          className="w-full h-full transition-opacity duration-1000 ease-in-out"
          fullScreen
       />
       
       {/* Hidden controls appearing on hover */}
       <div className="absolute top-0 left-0 w-full h-16 opacity-0 hover:opacity-100 transition-opacity flex justify-end items-start p-4 bg-gradient-to-b from-black/50 to-transparent z-50">
          <button 
            onClick={toggleFullScreen}
            className="bg-white/10 hover:bg-white/20 p-2 rounded text-white backdrop-blur-sm"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={24} />
          </button>
       </div>

       {/* Debug info (optional, helps confirmation of slide count) */}
       {signages.length > 1 && (
         <div className="absolute bottom-4 right-4 text-white/20 text-xs font-mono">
            {currentIndex + 1} / {signages.length}
         </div>
       )}
    </div>
  );
};
