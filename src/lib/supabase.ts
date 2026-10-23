/**
 * Supabase Client Configuration & Verification
 * Seamlessly supports both NEXT_PUBLIC_SUPABASE_* (Next.js / SSR) and VITE_SUPABASE_* variables.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) {
    return String(process.env.NEXT_PUBLIC_SUPABASE_URL);
  }
  if (typeof import.meta !== 'undefined') {
    if (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) {
      return String(import.meta.env.NEXT_PUBLIC_SUPABASE_URL);
    }
    if (import.meta.env?.VITE_SUPABASE_URL) {
      return String(import.meta.env.VITE_SUPABASE_URL);
    }
  }
  return '';
};

const getEnvKey = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return String(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  }
  if (typeof import.meta !== 'undefined') {
    if (import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return String(import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    }
    if (import.meta.env?.VITE_SUPABASE_ANON_KEY) {
      return String(import.meta.env.VITE_SUPABASE_ANON_KEY);
    }
  }
  return '';
};

export const isSupabaseConfigured = (): boolean => {
  const urlStr = getEnvUrl().trim();
  const keyStr = getEnvKey().trim();

  if (!urlStr || !keyStr) return false;

  // Check for placeholder or dummy strings
  if (
    urlStr.length === 0 ||
    keyStr.length < 30 ||
    urlStr.includes('your-project') ||
    urlStr.includes('MY_SUPABASE_URL') ||
    urlStr.includes('placeholder') ||
    keyStr.includes('your-anon-public-key') ||
    keyStr.includes('your-publishable-key') ||
    keyStr.includes('placeholder')
  ) {
    return false;
  }

  // Strict URL format validation
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (!parsed.hostname || parsed.hostname.length < 4) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

function initSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const validUrl = getEnvUrl().trim();
    const validKey = getEnvKey().trim();

    return createClient(validUrl, validKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'aisoft_admin_auth',
      },
    });
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
    return null;
  }
}

export const supabase: SupabaseClient | null = initSupabase();
