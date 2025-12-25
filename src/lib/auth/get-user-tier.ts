import { createClient } from '@/lib/supabase-server';

export type AccessTier = 'public' | 'free' | 'pro';

export interface RegulationAccess {
  tier: AccessTier;
  userId: string | null;
  canViewFullContent: boolean;
  canViewApplicationSteps: boolean;
  canViewAllMarkets: boolean;
  selectedMarket: string | null;
}

/**
 * Get the current user's regulation access tier.
 *
 * Access levels:
 * - public: No session - SEO layer only (summary, badges, flags)
 * - free: Logged in, free tier - Full content for ONE market
 * - pro: Paid subscription - Full access to all markets + application steps
 */
export async function getRegulationAccess(): Promise<RegulationAccess> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in = public tier (SEO layer only)
  if (!user) {
    return {
      tier: 'public',
      userId: null,
      canViewFullContent: false,
      canViewApplicationSteps: false,
      canViewAllMarkets: false,
      selectedMarket: null,
    };
  }

  // Logged in - check subscription from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

  const tier = profile?.subscription_tier || 'free';
  const status = profile?.subscription_status;
  const isPaid = ['starter', 'pro'].includes(tier) && status === 'active';

  // Get free user's selected market (if applicable)
  let selectedMarket: string | null = null;
  if (!isPaid) {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('selected_regulation_market')
      .eq('user_id', user.id)
      .single();

    selectedMarket = settings?.selected_regulation_market || null;
  }

  return {
    tier: isPaid ? 'pro' : 'free',
    userId: user.id,
    canViewFullContent: true,
    canViewApplicationSteps: isPaid,
    canViewAllMarkets: isPaid,
    selectedMarket,
  };
}

/**
 * Check if a free user can access a specific market.
 * Free users get access to ONE market of their choice.
 */
export function canAccessMarket(
  access: RegulationAccess,
  marketSlug: string
): boolean {
  // Pro users can access all markets
  if (access.canViewAllMarkets) return true;

  // Public users cannot access full content
  if (access.tier === 'public') return false;

  // Free users can access if:
  // 1. They haven't selected a market yet (first market = allowed)
  // 2. They're viewing their selected market
  return access.selectedMarket === null || access.selectedMarket === marketSlug;
}

/**
 * Set a free user's selected regulation market.
 * Once set, the user can only view full content for this market.
 */
export async function setFreeUserMarket(
  userId: string,
  marketSlug: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      selected_regulation_market: marketSlug,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );

  if (error) {
    console.error('Error setting free user market:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
