import React, { useState, useEffect } from 'react';
import { Monitor, Lock, Database, RefreshCw } from 'lucide-react';
import { SignageData } from '../types';
import { getSignages } from '../utils/storage';
import { SyncModal } from './SyncModal';

interface PublicDashboardProps {
  signages: SignageData[]; // Initial data
  onSelect: (data: SignageData) => void;
  onGoToAdmin: () => void;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({ signages: initialSignages, onSelect, onGoToAdmin }) => {
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [data, setData] = useState<SignageData[]>(initialSignages);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    const newData = await getSignages();
    setData(newData);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    // Auto refresh every 30 seconds if Supabase is connected
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Monitor className="text-black" size={32} />
              Layar Tamu (Public)
            </h1>
            <p className="text-gray-500 mt-1">Pilih data untuk ditampilkan.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={refreshData} className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 ${loading ? 'animate-spin' : ''}`}>
                <RefreshCw size={20} />
             </button>
             <button 
                onClick={() => setIsSyncOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors px-4 py-2 rounded-lg font-medium border border-gray-200"
             >
                <Database size={16} /> Setup Koneksi
             </button>
             <button 
                onClick={onGoToAdmin}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2"
             >
                <Lock size={16} /> Admin
             </button>
          </div>
        </header>

        <SyncModal isOpen={isSyncOpen} onClose={() => setIsSyncOpen(false)} />

        {/* Content */}
        {data.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-xl">
             <p className="text-xl font-medium text-gray-400">Menunggu data...</p>
             <button onClick={refreshData} className="mt-4 text-blue-600 hover:underline">Refresh</button>
           </div>
        ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className="bg-gray-50 rounded-xl p-8 cursor-pointer hover:bg-gray-100 hover:shadow-lg transition-all group border border-gray-100"
                >
                  <p className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">{item.welcomeLabel}</p>
                  <h3 className="font-bold text-gray-900 text-3xl leading-tight mb-4">{item.guestName}</h3>
                  {item.subText && <p className="text-lg text-gray-600">{item.subText}</p>}
                  
                  <div className="mt-8 flex items-center text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    TAMPILKAN LAYAR PENUH &rarr;
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};
