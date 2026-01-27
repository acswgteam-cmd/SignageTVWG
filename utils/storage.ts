import { SignageData } from '../types';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'signage_list_v2';
const SUPABASE_CONFIG_KEY = 'signage_supabase_config';

// --- CONFIGURATION ---
export const getSupabaseConfig = () => {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

export const saveSupabaseConfig = (config: {url: string, key: string}) => {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  window.location.reload();
};

// --- INITIALIZATION ---
let supabase: any = null;
const config = getSupabaseConfig();

if (config?.url && config?.key) {
    try {
        // Validasi URL sederhana agar tidak crash
        if(config.url.startsWith('http')) {
            supabase = createClient(config.url, config.key);
        }
    } catch (e) {
        console.error("Supabase init error:", e);
    }
}

// --- DATA METHODS ---

export const getSignages = async (): Promise<SignageData[]> => {
  // 1. Cek Local Storage dulu (Prioritas Kecepatan & Offline)
  const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // Jika ada supabase, coba fetch di background (async)
  // Jangan await di sini jika ingin UI instant, tapi untuk konsistensi data
  // kita gunakan timeout pendek.
  
  let cloudData: SignageData[] = [];
  
  if (supabase) {
    try {
        // Timeout 2 detik saja, jangan biarkan user menunggu lama
        const fetchPromise = supabase.from('signages').select('*').order('created_at', { ascending: false });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
        
        const result: any = await Promise.race([fetchPromise, timeoutPromise]);
        const { data, error } = result || {};

        if (!error && data) {
            cloudData = data.map((item: any) => ({
                id: item.id,
                createdAt: new Date(item.created_at).getTime(),
                welcomeLabel: item.welcome_label || 'WELCOME',
                guestName: item.guest_name || item.guestName || 'Tamu',
                subText: item.sub_text || '',
                backgroundImage: item.background_image
            }));
            
            // Update local storage dengan data terbaru dari cloud (Cache)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
            return cloudData;
        }
    } catch (err) {
        console.warn("Mode Offline/Lambat: Menggunakan data lokal.", err);
    }
  }

  // Jika hasil cloud kosong atau error, gunakan lokal
  if (localData.length > 0) return localData;

  // Jika cloud sukses tapi kosong, kembalikan kosong
  if (cloudData.length > 0) return cloudData;

  // Default jika tidak ada data sama sekali
  return [{
      id: 'default',
      createdAt: Date.now(),
      welcomeLabel: 'SELAMAT DATANG',
      guestName: 'Nama Tamu',
      subText: 'Nama Instansi'
  }];
};

export const saveSignage = async (data: Omit<SignageData, 'id' | 'createdAt'>): Promise<void> => {
    const newItem = {
        ...data,
        id: 'id_' + Date.now(),
        createdAt: Date.now(),
    };

    // 1. Simpan Lokal (Instant Feedback)
    const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedLocal = [newItem, ...currentLocal];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    // 2. Simpan Cloud (Fire and Forget)
    if (supabase) {
        supabase.from('signages').insert({
            id: newItem.id,
            welcome_label: newItem.welcomeLabel,
            guest_name: newItem.guestName,
            sub_text: newItem.subText,
            background_image: newItem.backgroundImage
        }).then(({ error }: any) => {
            if(error) console.error("Cloud save failed:", error);
        });
    }
};

export const deleteSignage = async (id: string) => {
    // 1. Hapus Lokal
    const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newLocal = currentLocal.filter((item: SignageData) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocal));

    // 2. Hapus Cloud
    if (supabase) {
        supabase.from('signages').delete().eq('id', id).then(({ error }: any) => {
             if(error) console.error("Cloud delete failed:", error);
        });
    }
};
