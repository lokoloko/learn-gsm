/**
 * Supabase cookie configuration for cross-subdomain SSO
 *
 * The magic is in domain: '.gostudiom.com' - this makes cookies visible
 * across all subdomains (cp.gostudiom.com, learn.gostudiom.com, etc.)
 */

const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  domain: isProduction ? '.gostudiom.com' : undefined, // Enables cross-subdomain SSO
  path: '/',
  sameSite: 'lax' as const,
  secure: isProduction,
};

export type CookieOptionsType = {
  domain?: string;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  expires?: Date;
};

export function getCookieOptions(additionalOptions?: Partial<CookieOptionsType>): CookieOptionsType {
  const secure = isProduction ? true : (additionalOptions?.secure ?? false);
  return {
    ...additionalOptions,
    ...cookieOptions,
    secure,
  };
}
