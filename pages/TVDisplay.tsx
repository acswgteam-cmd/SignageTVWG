import React, { useEffect, useState } from 'react';
import { signageService, supabase } from '../services/supabase';
import { Signage } from '../types';
import { SignagePreview } from '../components/SignagePreview';
import { Loader2, MonitorOff, Maximize2, Play, Grid, Smartphone, Monitor, RefreshCw, X, CheckCircle, Circle, ListVideo } from 'lucide-react';

type ViewMode = 'gallery' | 'playback';
type PlaybackType = 'loop' | 'single';

export const TVDisplay: React.FC = () => {
  const [signages, setSignages] = useState<Signage[]>([]);
  
  // App State
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [playbackType, setPlaybackType] = useState<PlaybackType>('loop');
  
  // Playback Queue State
  const [playQueue, setPlayQueue] = useState<Signage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
  // Use playQueue instead of all signages
  useEffect(() => {
    if (viewMode === 'playback' && playbackType === 'loop' && playQueue.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % playQueue.length);
      }, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [viewMode, playbackType, playQueue.length]);

  // 3. Handlers
  const startAllLoop = () => {
    if (signages.length === 0) return;
    setPlayQueue(signages); // Queue everything
    setPlaybackType('loop');
    setCurrentIndex(0);
    setViewMode('playback');
    requestFullScreen();
  };

  const startSelectedLoop = () => {
    if (selectedIds.size === 0) return;
    // Map selected IDs back to objects to maintain order of original list (or you could sort)
    const queue = signages.filter(s => selectedIds.has(s.id));
    
    setPlayQueue(queue);
    setPlaybackType('loop');
    setCurrentIndex(0);
    setViewMode('playback');
    requestFullScreen();
  };

  const playSingle = (signage: Signage) => {
    if (isSelectionMode) return; // Don't play if selecting
    
    setPlayQueue([signage]); // Queue just one
    setPlaybackType('single');
    setCurrentIndex(0);
    setViewMode('playback');
    requestFullScreen();
  };

  const stopPlayback = () => {
    setViewMode('gallery');
    setPlayQueue([]);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      if (isSelectionMode) {
          setSelectedIds(new Set()); // Clear on exit
      }
  };

  const requestFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
  };

  if (loading) return <div className="h-screen w-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // RENDER: PLAYBACK MODE
  if (viewMode === 'playback') {
    const currentSignage = playQueue[currentIndex];
    
    // Safety check
    if (!currentSignage) {
        if (playQueue.length > 0) setCurrentIndex(0);
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

         {playbackType === 'loop' && playQueue.length > 1 && (
             <div className="absolute bottom-4 right-4 text-white/30 text-xs font-mono">
                 PLAYING {playQueue.length > signages.length ? 'SELECTED' : ''}: {currentIndex + 1} / {playQueue.length}
             </div>
         )}
      </div>
    );
  }

  // RENDER: GALLERY MODE
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-4xl font-light tracking-widest uppercase">Werkudara TV</h1>
           <p className="text-gray-400 mt-2">Select content to display</p>
        </div>
        
        <div className="flex gap-3">
             {/* Selection Mode Toggle */}
            <button
                onClick={toggleSelectionMode}
                className={`px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${isSelectionMode ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
                <ListVideo size={20} />
                {isSelectionMode ? 'Cancel Selection' : 'Select Loop'}
            </button>

            {/* Play Actions */}
            {isSelectionMode && selectedIds.size > 0 ? (
                <button 
                    onClick={startSelectedLoop}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg animate-pulse"
                >
                    <Play size={20} fill="currentColor" /> Play Selected ({selectedIds.size})
                </button>
            ) : (
                <button 
                    onClick={startAllLoop}
                    disabled={signages.length === 0 || isSelectionMode}
                    className={`bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-lg shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105 ${isSelectionMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Play fill="currentColor" /> PLAY ALL LOOP ({signages.length})
                </button>
            )}
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
              {signages.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <div 
                        key={s.id} 
                        onClick={() => isSelectionMode ? toggleSelection(s.id) : playSingle(s)}
                        className={`
                            group relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                            ${isSelectionMode 
                                ? (isSelected ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-gray-900 scale-[1.02]' : 'opacity-60 hover:opacity-100')
                                : 'ring-0 hover:ring-4 ring-blue-500 hover:shadow-2xl hover:-translate-y-1'
                            }
                        `}
                    >
                        {/* Checkbox Indicator for Selection Mode */}
                        {isSelectionMode && (
                            <div className="absolute top-3 left-3 z-20">
                                {isSelected ? (
                                    <CheckCircle className="text-green-500 bg-white rounded-full" size={32} fill="white" />
                                ) : (
                                    <Circle className="text-white drop-shadow-md" size={32} />
                                )}
                            </div>
                        )}

                        {/* Aspect Ratio Container */}
                        <div className={`${s.layout === 'portrait' ? 'aspect-[9/16] w-1/2 mx-auto' : 'aspect-video w-full'} relative`}>
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Mini Preview Scaled */}
                                <div className={`w-[400%] h-[400%] absolute top-0 left-0 origin-top-left scale-[0.25]`}>
                                    <SignagePreview data={s} />
                                </div>
                            </div>
                        </div>

                        {/* Play Overlay (Only when NOT in selection mode) */}
                        {!isSelectionMode && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Play size={48} className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 drop-shadow-lg" fill="white" />
                            </div>
                        )}

                        {/* Icons */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
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
                  );
              })}
          </div>
      )}
    </div>
  );
};
