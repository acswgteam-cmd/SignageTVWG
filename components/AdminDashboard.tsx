import React, { useState, useRef } from 'react';
import { Plus, Trash2, Eye, Upload, Image as ImageIcon, Calendar, Monitor, Download, Wifi } from 'lucide-react';
import { SignageData, DEFAULT_DATA } from '../types';
import { saveSignage, deleteSignage } from '../utils/storage';
import { SyncModal } from './SyncModal';

interface AdminDashboardProps {
  signages: SignageData[];
  onRefresh: () => void;
  onSelect: (data: SignageData) => void;
  onSwitchToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ signages, onRefresh, onSelect, onSwitchToPublic }) => {
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [bgPreview, setBgPreview] = useState<string | undefined>(undefined);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSignage({
      ...formData,
      backgroundImage: bgPreview
    });
    setFormData(DEFAULT_DATA);
    setBgPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus data ini?')) {
      deleteSignage(id);
      onRefresh();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(signages, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signage_backup.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsedData)) {
            localStorage.setItem('signage_list_v2', JSON.stringify(parsedData));
            window.location.reload(); 
        }
      } catch (error) {
        alert('Gagal membaca file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-500">Atur tampilan Welcome Screen.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsSyncOpen(true)} className="btn-secondary">
                <Wifi size={16} /> Broadcast
            </button>
            <button onClick={handleExport} className="btn-secondary">
                <Download size={16} /> Backup
            </button>
            <button onClick={() => importInputRef.current?.click()} className="btn-secondary">
                <Upload size={16} /> Restore
            </button>
            <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImport} />
            
            <div className="w-px h-8 bg-gray-300 mx-2 hidden md:block"></div>

            <button onClick={onSwitchToPublic} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium text-sm">
              <Monitor size={18} /> Layar Tamu
            </button>
          </div>
        </header>

        <SyncModal isOpen={isSyncOpen} onClose={() => setIsSyncOpen(false)} mode="sender" dataToSync={signages} />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Plus size={20} /> Buat Baru</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Header (Welcome)</label>
                  <input name="welcomeLabel" value={formData.welcomeLabel} onChange={handleInputChange} className="input-field" placeholder="WELCOME" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Tamu</label>
                  <textarea name="guestName" value={formData.guestName} onChange={handleInputChange} className="input-field h-24" placeholder="Nama Tamu..." required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Instansi</label>
                  <input name="subText" value={formData.subText} onChange={handleInputChange} className="input-field" placeholder="Contoh: PT. Maju Jaya" />
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Background (Opsional)</label>
                   <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 h-32 relative overflow-hidden">
                      {bgPreview ? <img src={bgPreview} className="absolute inset-0 w-full h-full object-cover opacity-50" /> : <ImageIcon size={20} className="text-gray-400" />}
                      <span className="text-xs text-gray-500 relative z-10 mt-1">{bgPreview ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all">Simpan</button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
             <div className="grid sm:grid-cols-2 gap-6">
                {signages.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                    <div className="p-4 flex-1">
                      <p className="text-xs font-bold text-gray-400 tracking-wider mb-1 uppercase">{item.welcomeLabel}</p>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.guestName}</h3>
                      {item.subText && <p className="text-sm text-gray-500 mt-1">{item.subText}</p>}
                    </div>
                    <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t border-gray-100">
                       <button type="button" onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                       <button type="button" onClick={() => onSelect(item)} className="px-3 py-1 bg-black text-white text-sm rounded flex items-center gap-2"><Eye size={14} /> Buka</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
      <style>{`
        .input-field { width: 100%; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; }
        .input-field:focus { ring: 2px; ring-color: #000; border-color: #000; }
        .btn-secondary { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f3f4f6; color: #374151; border-radius: 8px; font-size: 14px; font-weight: 500; }
        .btn-secondary:hover { background: #e5e7eb; }
      `}</style>
    </div>
  );
};
