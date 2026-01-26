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
    // Reset form
    setFormData(DEFAULT_DATA);
    setBgPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteSignage(id);
      onRefresh();
    }
  };

  // --- EXPORT FUNCTION ---
  const handleExport = () => {
    const dataStr = JSON.stringify(signages, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signage_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- IMPORT FUNCTION ---
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsedData = JSON.parse(json);
        
        if (Array.isArray(parsedData)) {
            // Save directly to localStorage key defined in utils/storage
            localStorage.setItem('signage_list_v2', JSON.stringify(parsedData));
            alert('Data berhasil di-import! Halaman akan dimuat ulang.');
            onRefresh();
            window.location.reload(); 
        } else {
            alert('Format file JSON tidak valid.');
        }
      } catch (error) {
        console.error(error);
        alert('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Signage Admin</h1>
            <p className="text-gray-500">Buat signage baru atau pilih dari daftar. Data tersimpan lokal di browser ini.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Action Buttons Group */}
            <button 
                onClick={() => setIsSyncOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold transition-colors border border-blue-200"
                title="Sync Wireless ke TV"
            >
                <Wifi size={16} /> Broadcast ke TV
            </button>

            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                title="Download Backup Data"
            >
                <Download size={16} /> Backup
            </button>
            
            <button 
                onClick={() => importInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                title="Upload Backup Data"
            >
                <Upload size={16} /> Restore
            </button>
            <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".json" />

            <div className="w-px h-8 bg-gray-300 mx-2 hidden md:block"></div>

            <button 
              onClick={onSwitchToPublic}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors text-sm"
            >
              <Monitor size={18} />
              Mode Layar Tamu
            </button>
          </div>
        </header>

        {/* SYNC MODAL */}
        <SyncModal 
            isOpen={isSyncOpen}
            onClose={() => setIsSyncOpen(false)}
            mode="sender"
            dataToSync={signages}
        />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* LEFT COLUMN: CREATE FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-800">
                <Plus size={20} /> Buat Baru
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Welcome Text</label>
                  <input
                    name="welcomeLabel"
                    value={formData.welcomeLabel}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="e.g. WELCOME"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama Tamu / Instansi</label>
                  <textarea
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="Nama Tamu..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Sub Text (Opsional)</label>
                  <input
                    name="subText"
                    value={formData.subText}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="Keterangan tambahan..."
                  />
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Background Image</label>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all text-center relative overflow-hidden h-32"
                   >
                      {bgPreview ? (
                        <img src={bgPreview} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      ) : null}
                      <div className="relative z-10 flex flex-col items-center">
                        <ImageIcon size={20} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 font-medium">Upload (Max 3MB)</span>
                      </div>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   {bgPreview && (
                      <button 
                        type="button" 
                        onClick={(e) => { 
                            e.stopPropagation();
                            setBgPreview(undefined); 
                            if(fileInputRef.current) fileInputRef.current.value=''; 
                        }}
                        className="text-xs text-red-500 mt-1 hover:underline font-medium z-20 relative"
                      >
                        Hapus Gambar
                      </button>
                   )}
                </div>

                <button type="submit" className="w-full py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
                  Simpan Signage
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: LIST VIEW */}
          <div className="lg:col-span-2">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700">
                <Calendar size={20} /> Daftar Aktif
              </h2>
             
             {signages.length === 0 ? (
               <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-300">
                 <div className="flex flex-col items-center gap-3">
                    <Monitor className="text-gray-300" size={48} />
                    <p>Belum ada data signage.</p>
                 </div>
               </div>
             ) : (
               <div className="grid sm:grid-cols-2 gap-6">
                  {signages.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                      {/* Card Preview Header */}
                      <div className="h-32 bg-gray-200 relative overflow-hidden">
                        {item.backgroundImage ? (
                          <img src={item.backgroundImage} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-600" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all pointer-events-none" />
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-4 flex-1">
                          <p className="text-xs font-bold text-blue-600 tracking-wider mb-1">{item.welcomeLabel}</p>
                          <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight text-lg">{item.guestName}</h3>
                          {item.subText && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.subText}</p>}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                           <span className="text-[10px] text-gray-400">
                             {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                           </span>
                           <div className="flex gap-2">
                             <button 
                               type="button"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDelete(item.id);
                               }}
                               className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer relative z-10"
                               title="Hapus"
                             >
                               <Trash2 size={18} className="pointer-events-none" />
                             </button>
                             <button 
                               type="button"
                               onClick={(e) => {
                                   e.stopPropagation();
                                   onSelect(item);
                               }}
                               className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black flex items-center gap-2 transition-colors cursor-pointer relative z-10"
                             >
                               <Eye size={16} className="pointer-events-none" /> Buka
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};
