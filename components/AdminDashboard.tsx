import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Eye, Database, Monitor, Download } from 'lucide-react';
import { SignageData, DEFAULT_DATA } from '../types';
import { saveSignage, deleteSignage, getSignages } from '../utils/storage';
import { SyncModal } from './SyncModal';

interface AdminDashboardProps {
  signages: SignageData[];
  onRefresh: () => void;
  onSelect: (data: SignageData) => void;
  onSwitchToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ signages: initialSignages, onRefresh, onSelect, onSwitchToPublic }) => {
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  
  // Local state to handle async loading from Supabase
  const [localSignages, setLocalSignages] = useState<SignageData[]>(initialSignages);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getSignages();
    setLocalSignages(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSignage(formData);
    setFormData(DEFAULT_DATA);
    await loadData();
    onRefresh(); // Trigger parent refresh if needed
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data ini?')) {
      await deleteSignage(id);
      await loadData();
    }
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
            <button onClick={() => setIsSyncOpen(true)} className="btn-secondary text-green-700 bg-green-50 hover:bg-green-100">
                <Database size={16} /> Setup Cloud
            </button>
            <button onClick={onSwitchToPublic} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium text-sm shadow-sm transition-all">
              <Monitor size={18} /> Buka Layar Tamu
            </button>
          </div>
        </header>

        <SyncModal isOpen={isSyncOpen} onClose={() => setIsSyncOpen(false)} />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Plus size={20} /> Buat Baru</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Header (Welcome)</label>
                  <input name="welcomeLabel" value={formData.welcomeLabel} onChange={handleInputChange} className="input-field" placeholder="WELCOME" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Tamu</label>
                  <textarea name="guestName" value={formData.guestName} onChange={handleInputChange} className="input-field h-32 text-lg" placeholder="Nama Tamu..." required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Instansi</label>
                  <input name="subText" value={formData.subText} onChange={handleInputChange} className="input-field" placeholder="Contoh: Kementerian Kesehatan" />
                </div>

                <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg">Tampilkan di Layar</button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
             <div className="grid sm:grid-cols-2 gap-6">
                {localSignages.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col group">
                    <div className="p-6 flex-1 bg-white">
                      <p className="text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase">{item.welcomeLabel}</p>
                      <h3 className="font-bold text-gray-900 text-2xl leading-tight mb-2">{item.guestName}</h3>
                      {item.subText && <p className="text-sm text-gray-500 border-t border-gray-100 pt-2 mt-2">{item.subText}</p>}
                    </div>
                    <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t border-gray-100">
                       <button type="button" onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                       <button type="button" onClick={() => onSelect(item)} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-black transition-colors"><Eye size={14} /> Preview</button>
                    </div>
                  </div>
                ))}
                
                {localSignages.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <Monitor size={48} className="mb-4 opacity-20" />
                        <p>Belum ada data signage.</p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <style>{`
        .input-field { width: 100%; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; transition: all 0.2s; }
        .input-field:focus { ring: 2px; border-color: #000; background: #fff; }
        .btn-secondary { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
      `}</style>
    </div>
  );
};
