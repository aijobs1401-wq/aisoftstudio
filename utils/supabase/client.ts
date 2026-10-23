import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured(): boolean {
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL)) ||
    '';
  const key =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
    '';

  if (!url || !key) return false;
  const trimmedUrl = String(url).trim();
  const trimmedKey = String(key).trim();
  if (
    trimmedUrl.length === 0 ||
    trimmedKey.length < 30 ||
    trimmedUrl.includes('your-project') ||
    trimmedUrl.includes('placeholder')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmedUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export function createClient() {
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL)) ||
    '';
  const key =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
    '';

  // Fallback to valid placeholder URL if unconfigured so validateSupabaseUrl never crashes the app
  const safeUrl = isSupabaseConfigured() ? String(url).trim() : 'https://placeholder.supabase.co';
  const safeKey = isSupabaseConfigured() ? String(key).trim() : 'placeholder-anon-key-min-30-chars-padding-length';

  return createBrowserClient(safeUrl, safeKey);
}
