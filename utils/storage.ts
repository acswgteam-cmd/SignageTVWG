import { SignageData } from '../types';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'signage_list_v2';
const SUPABASE_CONFIG_KEY = 'signage_supabase_config';

interface SupabaseConfig {
  url: string;
  key: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  window.location.reload(); // Reload to initialize client
};

// Initialize Client if config exists
let supabase: any = null;
const config = getSupabaseConfig();

if (config && config.url && config.key) {
  try {
    // Basic validation to prevent crash on empty strings
    supabase = createClient(config.url, config.key);
  } catch (e) {
    console.error("Failed to init Supabase", e);
    // Fallback to null so app continues in offline mode
    supabase = null;
  }
}

export const getSignages = async (): Promise<SignageData[]> => {
  let dataFromCloud: SignageData[] = [];
  let useCloud = false;

  // 1. Try Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('signages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        useCloud = true;
        dataFromCloud = data.map((item: any) => ({
          id: item.id,
          createdAt: new Date(item.created_at).getTime(),
          welcomeLabel: item.welcome_label,
          guest_name: item.guest_name, // Handle typo in DB column gracefully
          guestName: item.guest_name || item.guestName, 
          subText: item.sub_text,
          backgroundImage: item.background_image
        }));
      }
    } catch (err) {
      console.warn("Supabase connection failed, falling back to local", err);
    }
  }

  // If cloud worked, return cloud data
  if (useCloud) return dataFromCloud;

  // 2. Fallback to LocalStorage (Offline Mode)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Return sample data for first time user so screen isn't empty
    return [{
        id: 'sample_1',
        createdAt: Date.now(),
        welcomeLabel: 'SELAMAT DATANG',
        guestName: 'Bapak Presiden',
        subText: 'Kunjungan Kerja 2024'
    }];
  }
  return JSON.parse(stored);
};

export const saveSignage = async (data: Omit<SignageData, 'id' | 'createdAt'>): Promise<void> => {
  const newItem = {
    ...data,
    id: 'id_' + Date.now(),
    createdAt: Date.now(),
  };

  // 1. Always Save to LocalStorage (Backup/Fast UI)
  const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updatedLocal = [newItem, ...currentLocal];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

  // 2. Save to Cloud if connected
  if (supabase) {
    try {
      await supabase.from('signages').insert({
        id: newItem.id,
        welcome_label: newItem.welcomeLabel,
        guest_name: newItem.guestName,
        sub_text: newItem.subText,
        background_image: newItem.backgroundImage
      });
    } catch (e) {
      console.error("Failed to save to cloud", e);
      alert("Disimpan di Lokal saja (Gagal koneksi Cloud)");
    }
  }
};

export const deleteSignage = async (id: string) => {
  // 1. Local Delete
  const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newLocal = currentLocal.filter((item: SignageData) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocal));

  // 2. Cloud Delete
  if (supabase) {
    try {
      await supabase.from('signages').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete from cloud", e);
    }
  }
};
