import React, { useEffect, useState } from 'react';
import { signageService, supabase } from '../services/supabase';
import { Signage } from '../types';
import { SignagePreview } from '../components/SignagePreview';
import { Loader2, MonitorOff, Maximize2, Play, Grid, Smartphone, Monitor, RefreshCw, X } from 'lucide-react';

type ViewMode = 'gallery' | 'playback';
type PlaybackType = 'loop' | 'single';

export const TVDisplay: React.FC = () => {
  const [signages, setSignages] = useState<Signage[]>([]);
  
  // App State
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [playbackType, setPlaybackType] = useState<PlaybackType>('loop');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Constants
  const ROTATION_INTERVAL = 15000;

  // 1. Initial Data Load & Realtime Subscription
  useEffect(() => {
    fetchData();

    // Subscribe to changes
    if (supabase) {
      const channel = supabase
        .channel('tv_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'signages' }, () => {
          console.log("Realtime update received");
          fetchData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const fetchData = async () => {
    try {
      const data = await signageService.getAll();
      // Filter active only
      const activeData = data.filter(s => s.is_active !== false);
      setSignages(activeData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Connection Error");
      setLoading(false);
    }
  };

  // 2. Slideshow Interval
  useEffect(() => {
    if (viewMode === 'playback' && playbackType === 'loop' && signages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % signages.length);
      }, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [viewMode, playbackType, signages.length]);

  // 3. Handlers
  const startLoop = () => {
    if (signages.length === 0) return;
    setPlaybackType('loop');
    setCurrentIndex(0);
    setViewMode('playback');
    requestFullScreen();
  };

  const playSingle = (index: number) => {
    setPlaybackType('single');
    setCurrentIndex(index);
    setViewMode('playback');
    requestFullScreen();
  };

  const stopPlayback = () => {
    setViewMode('gallery');
  };

  const requestFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
  };

  if (loading) return <div className="h-screen w-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // RENDER: PLAYBACK MODE
  if (viewMode === 'playback') {
    const currentSignage = signages[currentIndex];
    
    // Safety check if realtime deleted the item while playing
    if (!currentSignage) {
        // Fallback to gallery or first item
        if (signages.length > 0) setCurrentIndex(0);
        else setViewMode('gallery');
        return null;
    }

    return (
      <div className="relative h-screen w-screen bg-black overflow-hidden group">
         <SignagePreview 
            data={currentSignage} 
            className="w-full h-full"
            fullScreen
         />
         
         {/* Controls Overlay */}
         <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-2">
            <button 
                onClick={stopPlayback}
                className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md"
            >
                <Grid size={24} />
            </button>
         </div>

         {playbackType === 'loop' && signages.length > 1 && (
             <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono">
                 PLAYING ALL: {currentIndex + 1} / {signages.length}
             </div>
         )}
      </div>
    );
  }

  // RENDER: GALLERY MODE
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-4xl font-light tracking-widest uppercase">Werkudara TV</h1>
           <p className="text-gray-400 mt-2">Select content to display</p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={startLoop}
                disabled={signages.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105"
            >
                <Play fill="currentColor" /> PLAY LOOP ({signages.length})
            </button>
        </div>
      </header>

      {signages.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-600">
              <MonitorOff size={64} className="mb-4" />
              <p className="text-xl">No active content found.</p>
              <p className="text-sm">Create active signages in the dashboard.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {signages.map((s, idx) => (
                  <div 
                    key={s.id} 
                    onClick={() => playSingle(idx)}
                    className="group relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer ring-0 hover:ring-4 ring-blue-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                      {/* Aspect Ratio Container */}
                      <div className={`${s.layout === 'portrait' ? 'aspect-[9/16] w-1/2 mx-auto' : 'aspect-video w-full'} relative`}>
                         <div className="absolute inset-0 pointer-events-none">
                             {/* Mini Preview Scaled */}
                             <div className={`w-[400%] h-[400%] absolute top-0 left-0 origin-top-left scale-[0.25]`}>
                                 <SignagePreview data={s} />
                             </div>
                         </div>
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Play size={48} className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 drop-shadow-lg" fill="white" />
                      </div>

                      {/* Labels */}
                      <div className="absolute top-2 right-2 flex gap-1">
                          {s.layout === 'portrait' ? (
                             <span className="bg-blue-600/90 p-1.5 rounded-md backdrop-blur-sm"><Smartphone size={14} /></span>
                          ) : (
                             <span className="bg-gray-700/90 p-1.5 rounded-md backdrop-blur-sm"><Monitor size={14} /></span>
                          )}
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-10 translate-y-2 group-hover:translate-y-0 transition-transform">
                          <p className="font-bold truncate">{s.guest_name}</p>
                          <p className="text-xs text-gray-300 truncate">{s.welcome_label}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
