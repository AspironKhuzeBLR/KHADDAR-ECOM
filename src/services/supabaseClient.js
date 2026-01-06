import { createClient } from '@supabase/supabase-js';

// Change import.meta.env to process.env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Only create Supabase client if credentials are provided
// This prevents errors when Supabase is not configured (e.g., for image upload features)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log warning if Supabase is not configured
if (!supabase && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Supabase is not configured. Image upload features will not work. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.');
}