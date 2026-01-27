import { SignageData } from '../types';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'signage_list_v2';
const SUPABASE_CONFIG_KEY = 'signage_supabase_config';

interface SupabaseConfig {
  url: string;
  key: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  window.location.reload(); // Reload to initialize client
};

// Initialize Client if config exists
let supabase: any = null;
const config = getSupabaseConfig();
if (config) {
  try {
    supabase = createClient(config.url, config.key);
  } catch (e) {
    console.error("Failed to init Supabase", e);
  }
}

export const getSignages = async (): Promise<SignageData[]> => {
  // 1. Try Supabase
  if (supabase) {
    const { data, error } = await supabase
      .from('signages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      // Map DB fields to App fields
      return data.map((item: any) => ({
        id: item.id,
        createdAt: new Date(item.created_at).getTime(),
        welcomeLabel: item.welcome_label,
        guestName: item.guest_name,
        subText: item.sub_text,
        backgroundImage: item.background_image
      }));
    }
  }

  // 2. Fallback to LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
};

export const saveSignage = async (data: Omit<SignageData, 'id' | 'createdAt'>): Promise<void> => {
  const newItem = {
    ...data,
    id: 'id_' + Date.now(),
    createdAt: Date.now(),
  };

  // Local Save
  const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...currentLocal]));

  // Cloud Save
  if (supabase) {
    await supabase.from('signages').insert({
      id: newItem.id,
      welcome_label: newItem.welcomeLabel,
      guest_name: newItem.guestName,
      sub_text: newItem.subText,
      background_image: newItem.backgroundImage
    });
  }
};

export const deleteSignage = async (id: string) => {
  // Local Delete
  const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newLocal = currentLocal.filter((item: SignageData) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocal));

  // Cloud Delete
  if (supabase) {
    await supabase.from('signages').delete().eq('id', id);
  }
};
