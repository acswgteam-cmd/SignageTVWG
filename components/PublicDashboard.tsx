import React from 'react';
import { Eye, Monitor, Lock } from 'lucide-react';
import { SignageData } from '../types';

interface PublicDashboardProps {
  signages: SignageData[];
  onSelect: (data: SignageData) => void;
  onGoToAdmin: () => void;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({ signages, onSelect, onGoToAdmin }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-300 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Monitor className="text-blue-600" size={32} />
              Display Selection
            </h1>
            <p className="text-gray-500 mt-1">Pilih tampilan signage untuk ditampilkan di layar utama.</p>
          </div>
          <button 
            onClick={onGoToAdmin}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2 rounded-lg border border-transparent hover:border-gray-300"
          >
            <Lock size={16} /> Admin Login
          </button>
        </header>

        {/* Content */}
        {signages.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
             <div className="text-gray-300 mb-4">
               <Monitor size={64} />
             </div>
             <p className="text-xl font-medium text-gray-500">Tidak ada signage aktif.</p>
             <p className="text-gray-400">Silakan hubungi admin untuk membuat data baru.</p>
           </div>
        ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {signages.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group flex flex-col h-full"
                >
                  {/* Card Preview Header */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {item.backgroundImage ? (
                      <img src={item.backgroundImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-blue-600" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                    
                    {/* Floating Open Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-white/90 backdrop-blur text-blue-900 px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Eye size={20} /> Tampilkan
                        </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-blue-600 tracking-wider mb-2 uppercase">{item.welcomeLabel}</p>
                      <h3 className="font-bold text-gray-900 text-2xl leading-tight mb-2">{item.guestName}</h3>
                      {item.subText && <p className="text-sm text-gray-500 line-clamp-2">{item.subText}</p>}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-gray-400 text-xs">
                        <span>Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};