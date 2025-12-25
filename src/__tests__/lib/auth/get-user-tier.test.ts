import { canAccessMarket } from '@/lib/auth/get-user-tier';
import type { RegulationAccess } from '@/lib/auth/get-user-tier';

describe('canAccessMarket', () => {
  describe('pro users', () => {
    it('allows pro users to access any market', () => {
      const access: RegulationAccess = {
        tier: 'pro',
        userId: 'user-123',
        canViewFullContent: true,
        canViewApplicationSteps: true,
        canViewAllMarkets: true,
        selectedMarket: null,
      };

      expect(canAccessMarket(access, 'miami-beach-fl')).toBe(true);
      expect(canAccessMarket(access, 'austin-tx')).toBe(true);
      expect(canAccessMarket(access, 'any-market')).toBe(true);
    });
  });

  describe('public users', () => {
    it('denies public users access to any market', () => {
      const access: RegulationAccess = {
        tier: 'public',
        userId: null,
        canViewFullContent: false,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: null,
      };

      expect(canAccessMarket(access, 'miami-beach-fl')).toBe(false);
      expect(canAccessMarket(access, 'austin-tx')).toBe(false);
    });
  });

  describe('free users', () => {
    it('allows first market access when no market selected', () => {
      const access: RegulationAccess = {
        tier: 'free',
        userId: 'user-456',
        canViewFullContent: true,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: null,
      };

      expect(canAccessMarket(access, 'miami-beach-fl')).toBe(true);
      expect(canAccessMarket(access, 'austin-tx')).toBe(true);
    });

    it('allows access to selected market', () => {
      const access: RegulationAccess = {
        tier: 'free',
        userId: 'user-456',
        canViewFullContent: true,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: 'miami-beach-fl',
      };

      expect(canAccessMarket(access, 'miami-beach-fl')).toBe(true);
    });

    it('denies access to non-selected market', () => {
      const access: RegulationAccess = {
        tier: 'free',
        userId: 'user-456',
        canViewFullContent: true,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: 'miami-beach-fl',
      };

      expect(canAccessMarket(access, 'austin-tx')).toBe(false);
      expect(canAccessMarket(access, 'denver-co')).toBe(false);
    });
  });
});

describe('RegulationAccess types', () => {
  describe('tier values', () => {
    it('has correct tier values', () => {
      const publicAccess: RegulationAccess = {
        tier: 'public',
        userId: null,
        canViewFullContent: false,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: null,
      };

      const freeAccess: RegulationAccess = {
        tier: 'free',
        userId: 'user-1',
        canViewFullContent: true,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: null,
      };

      const proAccess: RegulationAccess = {
        tier: 'pro',
        userId: 'user-2',
        canViewFullContent: true,
        canViewApplicationSteps: true,
        canViewAllMarkets: true,
        selectedMarket: null,
      };

      expect(publicAccess.tier).toBe('public');
      expect(freeAccess.tier).toBe('free');
      expect(proAccess.tier).toBe('pro');
    });
  });

  describe('permission flags', () => {
    it('public tier has no permissions', () => {
      const access: RegulationAccess = {
        tier: 'public',
        userId: null,
        canViewFullContent: false,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: null,
      };

      expect(access.canViewFullContent).toBe(false);
      expect(access.canViewApplicationSteps).toBe(false);
      expect(access.canViewAllMarkets).toBe(false);
    });

    it('free tier can view full content but not application steps', () => {
      const access: RegulationAccess = {
        tier: 'free',
        userId: 'user-1',
        canViewFullContent: true,
        canViewApplicationSteps: false,
        canViewAllMarkets: false,
        selectedMarket: null,
      };

      expect(access.canViewFullContent).toBe(true);
      expect(access.canViewApplicationSteps).toBe(false);
      expect(access.canViewAllMarkets).toBe(false);
    });

    it('pro tier has all permissions', () => {
      const access: RegulationAccess = {
        tier: 'pro',
        userId: 'user-2',
        canViewFullContent: true,
        canViewApplicationSteps: true,
        canViewAllMarkets: true,
        selectedMarket: null,
      };

      expect(access.canViewFullContent).toBe(true);
      expect(access.canViewApplicationSteps).toBe(true);
      expect(access.canViewAllMarkets).toBe(true);
    });
  });
});
