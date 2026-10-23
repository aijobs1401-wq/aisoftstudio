import { createServerClient, type CookieOptions } from '@supabase/ssr';

export interface CookieStoreInterface {
  getAll?: () => { name: string; value: string }[];
  setAll?: (cookies: { name: string; value: string; options: CookieOptions }[]) => void;
  get?: (name: string) => { name: string; value: string } | undefined;
  set?: (name: string, value: string, options?: CookieOptions) => void;
}

/**
 * Creates a Supabase server client for Server Components, Server Actions, or Route Handlers.
 * Accepts an optional cookieStore compatible with Next.js headers cookies() or custom cookie handlers.
 */
export function createClient(cookieStore?: CookieStoreInterface) {
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL)) ||
    '';

  const key =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
    '';

  const safeUrl = url && String(url).startsWith('http') ? String(url).trim() : 'https://placeholder.supabase.co';
  const safeKey = key && String(key).length > 20 ? String(key).trim() : 'placeholder-anon-key-min-30-chars-padding-length';

  return createServerClient(safeUrl, safeKey, {
    cookies: {
      getAll() {
        return cookieStore?.getAll?.() || [];
      },
      setAll(cookiesToSet) {
        try {
          if (cookieStore?.setAll) {
            cookieStore.setAll(cookiesToSet);
          } else if (cookieStore?.set) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore?.set?.(name, value, options)
            );
          }
        } catch {
          // Handled if called from a read-only server component
        }
      },
    },
  });
}
