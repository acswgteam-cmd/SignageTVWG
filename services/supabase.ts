import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Signage, SignageInsert } from '../types';

// Hardcoded Credentials (Embedded as requested)
const DEFAULT_URL = 'https://veigctbjnyvsbxpmamas.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlaWdjdGJqbnl2c2J4cG1hbWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODgxNTksImV4cCI6MjA4NTA2NDE1OX0.6wZaq_rlIVFcWj2Yet92Oe0X8SBfkQb2YzhVI9n7R-E';

// Helper to get effective credentials
// Priority: LocalStorage (User Override) > Environment Vars (Vercel) > Hardcoded Defaults
export const getActiveUrl = () => {
  return localStorage.getItem('sb_url') || 
         process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.SUPABASE_URL || 
         DEFAULT_URL;
};

export const getActiveKey = () => {
  return localStorage.getItem('sb_key') || 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
         process.env.SUPABASE_ANON_KEY || 
         DEFAULT_KEY;
};

const supabaseUrl = getActiveUrl();
const supabaseKey = getActiveKey();

// Initialize Supabase client
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
    
    // Generate UUID client-side because the table definition (id text primary key)
    // does not have a default value generator like gen_random_uuid()
    const newId = crypto.randomUUID();

    const { data, error } = await supabase
      .from('signages')
      .insert([{ ...signage, id: newId }])
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
