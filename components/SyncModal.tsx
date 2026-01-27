import React, { useState, useEffect } from 'react';
import { Database, X, Check, AlertCircle, Save } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../utils/storage';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Props below are kept for compatibility but simplified
  mode?: any; 
  dataToSync?: any;
  onDataReceived?: any;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setUrl(config.url);
      setKey(config.key);
      setIsConnected(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!url || !key) return alert("Mohon isi URL dan Anon Key");
    saveSupabaseConfig({ url, key });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>

        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Database size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Koneksi Database (Supabase)</h2>
                    <p className="text-sm text-gray-500">Hubungkan Admin & TV via Cloud.</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supabase Project URL</label>
                    <input 
                        value={url} 
                        onChange={e => setUrl(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                        placeholder="https://xyz.supabase.co"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supabase Anon Key</label>
                    <input 
                        value={key} 
                        onChange={e => setKey(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                        type="password"
                    />
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <p className="text-xs text-blue-800 font-bold mb-2 flex items-center gap-2">
                    <AlertCircle size={14} /> SQL Setup Required
                </p>
                <p className="text-xs text-blue-700 mb-2">Jalankan query ini di SQL Editor Supabase Anda:</p>
                <code className="block bg-white p-2 rounded border border-blue-100 text-[10px] text-gray-600 font-mono overflow-x-auto">
                    create table signages (<br/>
                    &nbsp;&nbsp;id text primary key,<br/>
                    &nbsp;&nbsp;welcome_label text,<br/>
                    &nbsp;&nbsp;guest_name text,<br/>
                    &nbsp;&nbsp;sub_text text,<br/>
                    &nbsp;&nbsp;background_image text,<br/>
                    &nbsp;&nbsp;created_at timestamp with time zone default now()<br/>
                    );
                </code>
            </div>

            <button 
                onClick={handleSave}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
                <Save size={18} /> Simpan Koneksi
            </button>
        </div>
      </div>
    </div>
  );
};
