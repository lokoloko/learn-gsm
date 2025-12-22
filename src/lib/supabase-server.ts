import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cookieOptions, getCookieOptions, type CookieOptionsType } from './supabase-config';

/**
 * Create a Supabase client for server-side operations (Server Components, Route Handlers)
 * Uses cookie-based auth with cross-subdomain SSO support
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptionsType }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, getCookieOptions(options));
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
};

/**
 * Alias for createClient - for consistency with other GoStudioM apps
 */
export const getSupabaseServer = createClient;
