import React, { useEffect, useState, useRef } from 'react';
import { signageService, saveSupabaseConfig, isSupabaseConfigured, getActiveUrl, getActiveKey } from '../services/supabase';
import { Signage, SignageInsert } from '../types';
import { SignagePreview } from '../components/SignagePreview';
import { Monitor, Save, Trash2, Plus, Image as ImageIcon, Loader2, Settings, Database, AlertCircle, ArrowRight, Upload, PlayCircle, StopCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Editor: React.FC = () => {
  const [signages, setSignages] = useState<Signage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with configured check.
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());

  // Config State
  const [configUrl, setConfigUrl] = useState(getActiveUrl());
  const [configKey, setConfigKey] = useState(getActiveKey());

  // Form State
  const [formData, setFormData] = useState<SignageInsert>({
    welcome_label: 'WELCOME',
    guest_name: 'Team Kementerian Kesehatan',
    sub_text: '',
    background_image: '',
    is_active: true
  });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSignages();
    }
  }, []);

  // When selection changes, update form
  useEffect(() => {
    if (selectedId) {
      const selected = signages.find(s => s.id === selectedId);
      if (selected) {
        setFormData({
            welcome_label: selected.welcome_label,
            guest_name: selected.guest_name,
            sub_text: selected.sub_text,
            background_image: selected.background_image,
            is_active: selected.is_active !== undefined ? selected.is_active : true
        });
      }
    }
  }, [selectedId, signages]);

  const fetchSignages = async () => {
    setLoading(true);
    try {
      const data = await signageService.getAll();
      setSignages(data);
    } catch (error) {
      console.error('Error fetching signages:', error);
      if (!isSupabaseConfigured()) {
          setShowConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedId) {
        await signageService.update(selectedId, formData);
      } else {
        await signageService.create(formData);
      }
      await fetchSignages();
      if (!selectedId) {
          // Reset form but keep background if desired? No, reset all.
          setFormData({
            welcome_label: 'WELCOME',
            guest_name: 'New Guest',
            sub_text: '',
            background_image: '',
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Check your database connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this signage?')) return;
    try {
      await signageService.delete(id);
      const remaining = signages.filter(s => s.id !== id);
      setSignages(remaining);
      if (selectedId === id) {
        setSelectedId(null);
        handleCreateNew();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setFormData({
      welcome_label: 'WELCOME',
      guest_name: 'New Guest Name',
      sub_text: '',
      background_image: '',
      is_active: true
    });
  };

  const handleSaveConfig = () => {
    if (!configUrl || !configKey) {
        alert("Please enter both URL and Key");
        return;
    }
    saveSupabaseConfig(configUrl, configKey);
  };

  // Image Processing Logic
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImg(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max width 1920px (Full HD) is enough for TV
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to WebP, Quality 0.8 (High compression, good quality)
            const dataUrl = canvas.toDataURL('image/webp', 0.8);
            setFormData(prev => ({ ...prev, background_image: dataUrl }));
        }
        setIsProcessingImg(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen bg-gray-200 p-4 md:p-8 gap-6 overflow-hidden font-sans relative">
      
      {/* Config Modal */}
      {showConfig && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="flex items-center gap-3 mb-6 text-blue-900">
                    <Database size={32} />
                    <h2 className="text-2xl font-bold">Database Setup</h2>
                </div>
                
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    Connect to your Supabase project.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project URL</label>
                        <input 
                            type="text" 
                            value={configUrl}
                            onChange={(e) => setConfigUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Anon / Public Key</label>
                        <input 
                            type="password" 
                            value={configKey}
                            onChange={(e) => setConfigKey(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                     {isSupabaseConfigured() && (
                         <button 
                            onClick={() => setShowConfig(false)}
                            className="px-4 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
                         >
                            Cancel
                         </button>
                     )}
                     <button 
                        onClick={handleSaveConfig}
                        className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2"
                     >
                        Connect Database <ArrowRight size={18} />
                     </button>
                </div>
            </div>
        </div>
      )}

      {/* LEFT COLUMN: Input Form & Editor */}
      <aside className="w-full md:w-1/3 lg:w-[420px] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border border-gray-100 flex-shrink-0">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                {selectedId ? 'Edit Content' : 'Create New'}
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowConfig(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Database Settings"
                >
                    <Settings size={18} />
                </button>
                <button 
                    onClick={handleCreateNew} 
                    className="text-xs font-semibold text-blue-600 uppercase tracking-wider hover:bg-blue-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> Clear
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Live Mini Preview inside Form */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</label>
                    
                    {/* Active Toggle */}
                    <button 
                        onClick={() => setFormData(prev => ({...prev, is_active: !prev.is_active}))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            formData.is_active 
                            ? 'bg-green-100 text-green-700 ring-1 ring-green-400' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                        {formData.is_active ? <PlayCircle size={14}/> : <StopCircle size={14}/>}
                        {formData.is_active ? 'SHOW ON TV' : 'HIDDEN FROM TV'}
                    </button>
                </div>
                
                <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg border-4 border-gray-800 relative group">
                     {/* Scaling Wrapper for 16:9 effect in small container */}
                     <div className="w-[400%] h-[400%] absolute top-0 left-0 origin-top-left scale-[0.25]">
                        <SignagePreview data={formData} />
                     </div>
                     {!formData.is_active && (
                         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                             <div className="bg-black/80 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                <MonitorOffIcon size={16} /> HIDDEN
                             </div>
                         </div>
                     )}
                </div>
            </div>

            {/* Inputs */}
            <div className="p-6 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Label</label>
                    <input 
                        type="text" 
                        value={formData.welcome_label}
                        onChange={(e) => setFormData({...formData, welcome_label: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium placeholder-gray-400"
                        placeholder="e.g. WELCOME"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guest / Event Name</label>
                    <textarea 
                        value={formData.guest_name}
                        onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none placeholder-gray-400"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Text</label>
                    <input 
                        type="text" 
                        value={formData.sub_text}
                        onChange={(e) => setFormData({...formData, sub_text: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium placeholder-gray-400"
                        placeholder="e.g. Ministry of Health"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image</label>
                    
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />

                    <div className="space-y-3">
                        {/* URL Input (Fallback) */}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={formData.background_image || ''}
                                onChange={(e) => setFormData({...formData, background_image: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium placeholder-gray-400"
                                placeholder="https://... or Upload"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessingImg}
                                className="flex-shrink-0 w-12 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors disabled:opacity-50"
                                title="Upload & Compress"
                            >
                                {isProcessingImg ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 pl-1">
                            Supported: Upload (auto-converts to WebP) or Direct URL.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 space-y-3">
             <button 
                onClick={handleSave}
                disabled={isSaving || isProcessingImg}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
             >
                 {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                 {selectedId ? 'UPDATE CONTENT' : 'SAVE NEW CONTENT'}
             </button>

             <Link 
                to="/tv" 
                target="_blank"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
             >
                <Monitor size={18} /> Open TV Mode
             </Link>
        </div>
      </aside>

      {/* RIGHT COLUMN: Thumbnails Grid */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-6 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Signage Gallery</h1>
                <p className="text-gray-500 mt-1">Select a thumbnail to edit or preview</p>
            </div>
            <div className="flex items-center gap-4 hidden md:flex">
                {!isSupabaseConfigured() && (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase bg-red-100 px-3 py-1 rounded-full">
                        <AlertCircle size={14} /> Disconnected
                    </span>
                )}
                <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">{signages.length} Items</div>
                </div>
            </div>
        </div>

        {loading ? (
           <div className="flex-1 flex items-center justify-center">
             <Loader2 className="animate-spin text-gray-400" size={48} />
           </div>
        ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
                {signages.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400">
                        <Plus size={48} className="mb-4 opacity-50" />
                        <p>{isSupabaseConfigured() ? "No content yet. Create your first signage!" : "Connect database to start."}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {/* Add New Card */}
                        <div 
                            onClick={handleCreateNew}
                            className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${!selectedId ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-blue-400 hover:bg-white text-gray-400 hover:text-blue-500'}`}
                        >
                             <Plus size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                             <span className="font-semibold text-sm uppercase tracking-wide">Create New</span>
                        </div>

                        {signages.map((s) => (
                            <div 
                                key={s.id}
                                onClick={() => setSelectedId(s.id)}
                                className={`relative aspect-video bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all group hover:shadow-xl ${selectedId === s.id ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:scale-[1.02]'}`}
                            >
                                {/* Thumbnail Scaler */}
                                <div className={`w-[400%] h-[400%] absolute top-0 left-0 origin-top-left scale-[0.25] pointer-events-none bg-gray-900 ${s.is_active === false ? 'opacity-40 grayscale' : ''}`}>
                                    <SignagePreview data={s} />
                                </div>
                                
                                {/* Status Badge */}
                                <div className="absolute bottom-3 left-3 flex gap-2">
                                     {s.is_active === false && (
                                         <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                             <MonitorOffIcon size={10} /> HIDDEN
                                         </span>
                                     )}
                                     {s.is_active !== false && (
                                         <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                             <PlayCircle size={10} /> TV
                                         </span>
                                     )}
                                </div>
                                
                                {/* Hover Overlay Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <span className="text-white font-bold tracking-wider text-sm">EDIT CONTENT</span>
                                    <button 
                                        onClick={(e) => handleDelete(s.id, e)}
                                        className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Active Badge */}
                                {selectedId === s.id && (
                                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                        EDITING
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

const MonitorOffIcon = ({size}: {size:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 17 4 4"/><path d="M21 17l-4 4"/><path d="M8 2h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M12 18h.01"/></svg>
);
