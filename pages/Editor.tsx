import React, { useEffect, useState, useRef } from 'react';
import { signageService, backgroundService, saveSupabaseConfig, isSupabaseConfigured, getActiveUrl, getActiveKey } from '../services/supabase';
import { Signage, SignageInsert, SavedBackground } from '../types';
import { SignagePreview } from '../components/SignagePreview';
import { Monitor, Save, Trash2, Plus, Image as ImageIcon, Loader2, Settings, Database, AlertCircle, ArrowRight, Upload, PlayCircle, StopCircle, Smartphone, Monitor as MonitorIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Editor: React.FC = () => {
  const [signages, setSignages] = useState<Signage[]>([]);
  const [savedBackgrounds, setSavedBackgrounds] = useState<SavedBackground[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  const [configUrl, setConfigUrl] = useState(getActiveUrl());
  const [configKey, setConfigKey] = useState(getActiveKey());

  // Form State
  const [formData, setFormData] = useState<SignageInsert>({
    welcome_label: 'WELCOME',
    guest_name: 'Team Kementerian Kesehatan',
    sub_text: '',
    background_image: '',
    is_active: true,
    layout: 'landscape'
  });

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSignages();
      fetchBackgrounds();
    }
  }, []);

  // When selection changes
  useEffect(() => {
    if (selectedId) {
      const selected = signages.find(s => s.id === selectedId);
      if (selected) {
        setFormData({
            welcome_label: selected.welcome_label,
            guest_name: selected.guest_name,
            sub_text: selected.sub_text,
            background_image: selected.background_image,
            is_active: selected.is_active !== undefined ? selected.is_active : true,
            layout: selected.layout || 'landscape'
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

  const fetchBackgrounds = async () => {
    try {
      const bgs = await backgroundService.getSavedBackgrounds();
      setSavedBackgrounds(bgs);
    } catch (e) {
      console.error(e);
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
          // Reset relevant fields
          setFormData({
            welcome_label: 'WELCOME',
            guest_name: 'New Guest',
            sub_text: '',
            background_image: formData.background_image, // Keep background for convenience
            is_active: true,
            layout: formData.layout
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
      is_active: true,
      layout: 'landscape'
    });
  };

  const handleSaveConfig = () => {
    if (!configUrl || !configKey) {
        alert("Please enter both URL and Key");
        return;
    }
    saveSupabaseConfig(configUrl, configKey);
  };

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
            const dataUrl = canvas.toDataURL('image/webp', 0.8);
            
            // Set State
            setFormData(prev => ({ ...prev, background_image: dataUrl }));
            
            // Save to DB for reuse (fire and forget)
            backgroundService.saveBackground(dataUrl).then(() => {
                fetchBackgrounds(); 
            });
        }
        setIsProcessingImg(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteBackground = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved background?')) return;
    try {
        await backgroundService.deleteBackground(id);
        await fetchBackgrounds();
    } catch (e) {
        console.error("Failed to delete background", e);
    }
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
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">Connect to Supabase.</p>
                <div className="space-y-4">
                    <input type="text" value={configUrl} onChange={(e) => setConfigUrl(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none" placeholder="Project URL"/>
                    <input type="password" value={configKey} onChange={(e) => setConfigKey(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none" placeholder="Public Key"/>
                </div>
                <div className="mt-8 flex gap-3">
                     {isSupabaseConfigured() && <button onClick={() => setShowConfig(false)} className="px-4 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>}
                     <button onClick={handleSaveConfig} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2">Connect <ArrowRight size={18} /></button>
                </div>
            </div>
        </div>
      )}

      {/* LEFT COLUMN: Input Form & Editor */}
      <aside className="w-full md:w-1/3 lg:w-[450px] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border border-gray-100 flex-shrink-0">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{selectedId ? 'Edit Content' : 'Create New'}</h2>
            <div className="flex gap-2">
                <button onClick={() => setShowConfig(true)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Database"><Settings size={18} /></button>
                <button onClick={handleCreateNew} className="text-xs font-semibold text-blue-600 uppercase tracking-wider hover:bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1"><Plus size={14} /> Clear</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Live Preview */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</label>
                    <div className="flex gap-2">
                        {/* Orientation Toggle */}
                        <div className="bg-gray-100 p-1 rounded-lg flex">
                            <button 
                                onClick={() => setFormData(p => ({...p, layout: 'landscape'}))}
                                className={`p-1.5 rounded-md transition-all ${formData.layout !== 'portrait' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                                title="Landscape"
                            >
                                <MonitorIcon size={14} />
                            </button>
                            <button 
                                onClick={() => setFormData(p => ({...p, layout: 'portrait'}))}
                                className={`p-1.5 rounded-md transition-all ${formData.layout === 'portrait' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                                title="Portrait"
                            >
                                <Smartphone size={14} />
                            </button>
                        </div>
                        {/* Active Toggle */}
                        <button 
                            onClick={() => setFormData(prev => ({...prev, is_active: !prev.is_active}))}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${formData.is_active ? 'bg-green-100 text-green-700 ring-1 ring-green-400' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {formData.is_active ? <PlayCircle size={14}/> : <StopCircle size={14}/>}
                        </button>
                    </div>
                </div>
                
                {/* Preview Box - Dynamic Aspect Ratio */}
                <div 
                    className={`mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-lg border-4 border-gray-800 relative group transition-all duration-300 ${formData.layout === 'portrait' ? 'aspect-[9/16] w-[200px]' : 'aspect-video w-full'}`}
                >
                     <div className={`w-full h-full relative ${formData.layout === 'portrait' ? 'overflow-hidden' : ''}`}>
                         {formData.layout === 'landscape' ? (
                            <div className="w-[400%] h-[400%] absolute top-0 left-0 origin-top-left scale-[0.25]">
                                <SignagePreview data={formData} />
                            </div>
                         ) : (
                            <div className="w-full h-full">
                                <SignagePreview data={formData} />
                            </div>
                         )}
                         
                         {!formData.is_active && (
                             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                                 <div className="bg-black/80 text-white px-3 py-1 rounded text-xs font-bold">HIDDEN</div>
                             </div>
                         )}
                     </div>
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
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guest / Event Name</label>
                    <textarea 
                        value={formData.guest_name}
                        onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Text</label>
                    <input 
                        type="text" 
                        value={formData.sub_text}
                        onChange={(e) => setFormData({...formData, sub_text: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image</label>
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload}/>
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            value={formData.background_image || ''}
                            onChange={(e) => setFormData({...formData, background_image: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-gray-400"
                            placeholder="Select below or Upload..."
                        />
                        {formData.background_image && (
                            <button 
                                onClick={() => setFormData({...formData, background_image: ''})}
                                className="flex-shrink-0 w-12 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-xl"
                                title="Clear Background"
                            >
                                <X size={20} />
                            </button>
                        )}
                        <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingImg} className="flex-shrink-0 w-12 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl disabled:opacity-50">
                            {isProcessingImg ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        </button>
                    </div>
                    
                    {/* Reusable Backgrounds Gallery */}
                    {savedBackgrounds.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Saved Backgrounds</p>
                            <div className="grid grid-cols-4 gap-2">
                                {savedBackgrounds.map(bg => (
                                    <div key={bg.id} className="relative group">
                                        <button
                                            onClick={() => setFormData(p => ({...p, background_image: bg.image_data}))}
                                            className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 hover:ring-2 ring-blue-200 transition-all"
                                        >
                                            <img src={bg.image_data} className="w-full h-full object-cover" alt="bg" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteBackground(bg.id, e)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                                            title="Delete background"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 space-y-3">
             <button 
                onClick={handleSave}
                disabled={isSaving || isProcessingImg}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
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
                <p className="text-gray-500 mt-1">Items older than 7 days are automatically removed.</p>
            </div>
            <div className="text-sm font-medium text-gray-500">{signages.length} Items</div>
        </div>

        {loading ? (
           <div className="flex-1 flex items-center justify-center">
             <Loader2 className="animate-spin text-gray-400" size={48} />
           </div>
        ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {/* Create New Card */}
                    <div 
                        onClick={handleCreateNew}
                        className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${!selectedId ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-blue-400 hover:bg-white text-gray-400 hover:text-blue-500'}`}
                    >
                         <Plus size={48} className="mb-2" />
                         <span className="font-semibold text-sm uppercase">Create New</span>
                    </div>

                    {signages.map((s) => (
                        <div 
                            key={s.id}
                            onClick={() => setSelectedId(s.id)}
                            className={`relative bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all group hover:shadow-xl ${selectedId === s.id ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:scale-[1.02]'} ${s.layout === 'portrait' ? 'aspect-[9/16] max-w-[240px] mx-auto' : 'aspect-video'}`}
                        >
                            <div className="w-full h-full relative">
                                <div className={`w-[400%] h-[400%] absolute top-0 left-0 origin-top-left scale-[0.25] pointer-events-none bg-gray-900 ${s.is_active === false ? 'opacity-40 grayscale' : ''}`}>
                                    <SignagePreview data={s} />
                                </div>
                            </div>
                            
                            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                                 {s.is_active === false ? (
                                     <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><StopCircle size={10} /> HIDDEN</span>
                                 ) : (
                                     <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><PlayCircle size={10} /> TV</span>
                                 )}
                                 {s.layout === 'portrait' && (
                                     <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Smartphone size={10} /> VERTICAL</span>
                                 )}
                            </div>
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                <span className="text-white font-bold tracking-wider text-sm">EDIT</span>
                                <button onClick={(e) => handleDelete(s.id, e)} className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
