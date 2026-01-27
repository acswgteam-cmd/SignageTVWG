import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Signage, SignageInsert } from '../types';

// Try to get credentials from LocalStorage first, then environment variables
const getStoredUrl = () => localStorage.getItem('sb_url') || process.env.SUPABASE_URL || '';
const getStoredKey = () => localStorage.getItem('sb_key') || process.env.SUPABASE_ANON_KEY || '';

const supabaseUrl = getStoredUrl();
const supabaseKey = getStoredKey();

// Initialize Supabase client if credentials exist
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper to save credentials from UI
export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_key', key);
  window.location.reload(); // Reload to re-initialize client
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('sb_url');
  localStorage.removeItem('sb_key');
  window.location.reload();
};

export const isSupabaseConfigured = () => !!supabase;

export const signageService = {
  async getAll() {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('signages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Signage[];
  },

  async create(signage: SignageInsert) {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('signages')
      .insert([signage])
      .select()
      .single();
    
    if (error) throw error;
    return data as Signage;
  },

  async update(id: string, updates: Partial<Signage>) {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('signages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Signage;
  },

  async delete(id: string) {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase
      .from('signages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};