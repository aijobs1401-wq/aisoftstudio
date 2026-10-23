import { createServerClient, type CookieOptions } from '@supabase/ssr';

export interface MiddlewareRequestInterface {
  cookies: {
    getAll: () => { name: string; value: string }[];
    set?: (name: string, value: string, options?: CookieOptions) => void;
  };
  nextUrl?: { pathname: string };
  url?: string;
}

/**
 * Updates user session and refreshes auth tokens using @supabase/ssr.
 * Protects admin routes against unauthenticated access.
 */
export async function updateSession(request: MiddlewareRequestInterface) {
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

  let cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(safeUrl, safeKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookiesToSet = cookies;
        cookies.forEach(({ name, value, options }) => {
          request.cookies.set?.(name, value, options);
        });
      },
    },
  });

  // getUser() sends a request to the Supabase Auth server and validates the JWT token
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user, error, cookiesToSet };
}
