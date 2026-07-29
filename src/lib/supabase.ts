import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key-here'
);

// Helper to instantiate supabase safely without throwing initialization errors on load
function initSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Errore nell\'inizializzazione di Supabase:', err);
    return null;
  }
}

export const supabase = initSupabase();

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase non è configurato. Inserisci VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env');
  }
  return supabase;
}
