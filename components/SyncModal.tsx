import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import { Wifi, X, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SignageData } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'sender' | 'receiver';
  dataToSync?: SignageData[];
  onDataReceived?: (data: SignageData[]) => void;
}

// Helper to generate a short random code
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 to avoid confusion
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const SyncModal: React.FC<SyncModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  dataToSync, 
  onDataReceived 
}) => {
  const [peerId, setPeerId] = useState<string>('');
  const [targetCode, setTargetCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'transferring' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const peerRef = useRef<Peer | null>(null);

  // Initialize Peer
  useEffect(() => {
    if (!isOpen) {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setStatus('idle');
        setErrorMessage('');
        setTargetCode('');
        return;
    }

    const code = generateCode();
    // We use a prefix to ensure uniqueness on the public PeerJS server
    const fullId = `signage-app-${code}`;

    // If receiver, we don't strictly need a fixed ID, but good for debugging. 
    // If sender, this ID is what the receiver connects to.
    const myId = mode === 'sender' ? fullId : undefined;

    const peer = new Peer(myId, {
      debug: 1
    });

    peer.on('open', (id) => {
      // If sender, we display the short code derived from the ID
      if (mode === 'sender') {
          setPeerId(code);
      }
    });

    peer.on('connection', (conn) => {
      // SENDER LOGIC: When a receiver connects
      if (mode === 'sender' && dataToSync) {
        setStatus('transferring');
        conn.on('open', () => {
          // Send data
          conn.send(dataToSync);
          setTimeout(() => {
              setStatus('success');
          }, 500);
        });
      }
    });

    peer.on('error', (err) => {
      console.error(err);
      setStatus('error');
      setErrorMessage('Gagal terhubung ke server jaringan.');
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, [isOpen, mode, dataToSync]);

  const handleConnect = () => {
    if (!targetCode || !peerRef.current) return;
    
    setStatus('connecting');
    const fullTargetId = `signage-app-${targetCode.toUpperCase()}`;
    const conn = peerRef.current.connect(fullTargetId);

    conn.on('open', () => {
      setStatus('transferring');
    });

    conn.on('data', (data: any) => {
      if (Array.isArray(data)) {
        if (onDataReceived) {
            onDataReceived(data);
            setStatus('success');
        }
      } else {
          setStatus('error');
          setErrorMessage('Data yang diterima tidak valid.');
      }
    });

    conn.on('error', (err) => {
        setStatus('error');
        setErrorMessage('Koneksi terputus atau kode salah.');
    });

    // Timeout fallback
    setTimeout(() => {
        if (status === 'connecting') {
            setStatus('error');
            setErrorMessage('Waktu habis. Pastikan Laptop sudah membuka menu Broadcast.');
        }
    }, 10000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
            <X size={24} />
        </button>

        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wifi size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {mode === 'sender' ? 'Broadcast ke TV' : 'Sync dari Laptop'}
            </h2>
            
            <p className="text-gray-500 text-sm mb-8">
                {mode === 'sender' 
                    ? 'Buka menu "Sync" di Smart TV Anda dan masukkan kode di bawah ini.' 
                    : 'Masukkan kode yang muncul di layar Laptop Anda untuk menyalin data.'}
            </p>

            {/* SENDER UI */}
            {mode === 'sender' && (
                <div className="bg-gray-100 p-6 rounded-xl border-2 border-dashed border-gray-300 mb-6">
                    {peerId ? (
                        <>
                            <p className="text-xs uppercase font-bold text-gray-500 mb-2">KODE KONEKSI</p>
                            <p className="text-4xl font-mono font-bold text-blue-700 tracking-widest">{peerId}</p>
                        </>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                            <Loader2 className="animate-spin" size={20} /> Membuat sesi...
                        </div>
                    )}
                </div>
            )}

            {/* RECEIVER UI */}
            {mode === 'receiver' && status !== 'success' && (
                <div className="space-y-4 mb-6">
                    <input 
                        type="text" 
                        value={targetCode}
                        onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
                        placeholder="Masukan 5 Huruf Kode (Contoh: A1B2C)"
                        className="w-full text-center text-2xl font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none uppercase"
                        disabled={status === 'connecting' || status === 'transferring'}
                    />
                    <button 
                        onClick={handleConnect}
                        disabled={!targetCode || status === 'connecting' || status === 'transferring'}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {status === 'connecting' ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                        {status === 'connecting' ? 'Menghubungkan...' : 'Mulai Sync'}
                    </button>
                </div>
            )}

            {/* STATUS FEEDBACK */}
            {status === 'transferring' && (
                <div className="text-blue-600 font-medium animate-pulse mb-4">
                    Mengirim data... Jangan tutup jendela ini.
                </div>
            )}

            {status === 'success' && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-left">
                    <CheckCircle size={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold">Berhasil!</p>
                        <p className="text-sm">Data signage telah disinkronisasi.</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-left mt-4">
                    <AlertCircle size={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold">Gagal</p>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};