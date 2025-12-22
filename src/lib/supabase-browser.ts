import { createBrowserClient } from '@supabase/ssr';
import { cookieOptions } from './supabase-config';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for browser-side operations
 * Uses cookie-based auth with cross-subdomain SSO support
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookieOptions }
    );
  }
  return supabaseClient;
}

/**
 * Alias for consistency
 */
export const createClient = getSupabaseBrowserClient;
