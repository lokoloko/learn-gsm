import {
  deriveStrictness,
  extractFee,
  extractMaxFine,
  hasNightCap,
  isPrimaryResidenceRequired,
  isPermitRequired,
  getTotalTaxRate,
  formatTaxRate,
  formatCurrency,
  extractPublicFlags,
  getStateName,
  groupByState,
  formatConfidence,
  getPermitName,
  getProcessingTime,
  getRequiredDocuments,
  STRICTNESS_META,
  STATE_NAMES,
  type StrictnessLevel,
} from '@/lib/utils/regulations';
import type { Regulation, RegistrationData, PenaltiesData, LimitsData } from '@/types/database';

describe('regulations utility', () => {
  describe('STRICTNESS_META', () => {
    it('should have metadata for all strictness levels', () => {
      const levels: StrictnessLevel[] = ['strict', 'moderate', 'permissive'];
      levels.forEach((level) => {
        expect(STRICTNESS_META[level]).toBeDefined();
        expect(STRICTNESS_META[level].label).toBeDefined();
        expect(STRICTNESS_META[level].color).toBeDefined();
        expect(STRICTNESS_META[level].bgColor).toBeDefined();
        expect(STRICTNESS_META[level].description).toBeDefined();
      });
    });

    it('should have correct labels', () => {
      expect(STRICTNESS_META.strict.label).toBe('Strict');
      expect(STRICTNESS_META.moderate.label).toBe('Moderate');
      expect(STRICTNESS_META.permissive.label).toBe('Permissive');
    });
  });

  describe('extractFee()', () => {
    it('should extract city fee when present', () => {
      const registration: RegistrationData = {
        city: { fee: 500 },
      };
      expect(extractFee(registration)).toBe(500);
    });

    it('should extract county fee when city fee is absent', () => {
      const registration: RegistrationData = {
        county: { fee: 300 },
      };
      expect(extractFee(registration)).toBe(300);
    });

    it('should prefer city fee over county fee', () => {
      const registration: RegistrationData = {
        city: { fee: 500 },
        county: { fee: 300 },
      };
      expect(extractFee(registration)).toBe(500);
    });

    it('should return null when no fee present', () => {
      const registration: RegistrationData = {
        city: { required: true },
      };
      expect(extractFee(registration)).toBeNull();
    });

    it('should return null for null input', () => {
      expect(extractFee(null)).toBeNull();
    });
  });

  describe('extractMaxFine()', () => {
    it('should extract city max fine', () => {
      const penalties: PenaltiesData = {
        city: { max_fine: 10000 },
      };
      expect(extractMaxFine(penalties)).toBe(10000);
    });

    it('should return higher of city and county fines', () => {
      const penalties: PenaltiesData = {
        city: { max_fine: 5000 },
        county: { max_fine: 15000 },
      };
      expect(extractMaxFine(penalties)).toBe(15000);
    });

    it('should return null when no fines present', () => {
      const penalties: PenaltiesData = {
        city: { notes: 'Some notes' },
      };
      expect(extractMaxFine(penalties)).toBeNull();
    });

    it('should return null for null input', () => {
      expect(extractMaxFine(null)).toBeNull();
    });
  });

  describe('hasNightCap()', () => {
    it('should return true when city has night cap', () => {
      const limits: LimitsData = {
        city: { nights_per_year: 90 },
      };
      expect(hasNightCap(limits)).toBe(true);
    });

    it('should return true when county has night cap', () => {
      const limits: LimitsData = {
        county: { nights_per_year: 120 },
      };
      expect(hasNightCap(limits)).toBe(true);
    });

    it('should return false when no night cap', () => {
      const limits: LimitsData = {
        city: { max_guests: 10 },
      };
      expect(hasNightCap(limits)).toBe(false);
    });

    it('should return false for null input', () => {
      expect(hasNightCap(null)).toBe(false);
    });
  });

  describe('isPrimaryResidenceRequired()', () => {
    it('should return true when eligibility requires primary residence', () => {
      expect(
        isPrimaryResidenceRequired(
          { primary_residence_required: true } as any,
          null
        )
      ).toBe(true);
    });

    it('should return true when city registration requires primary residence', () => {
      const registration: RegistrationData = {
        city: { primary_residence_required: true },
      };
      expect(isPrimaryResidenceRequired(null, registration)).toBe(true);
    });

    it('should return false when not required', () => {
      const registration: RegistrationData = {
        city: { required: true },
      };
      expect(isPrimaryResidenceRequired(null, registration)).toBe(false);
    });
  });

  describe('isPermitRequired()', () => {
    it('should return true when city permit required', () => {
      const registration: RegistrationData = {
        city: { required: true },
      };
      expect(isPermitRequired(registration)).toBe(true);
    });

    it('should return true when county permit required', () => {
      const registration: RegistrationData = {
        county: { required: true },
      };
      expect(isPermitRequired(registration)).toBe(true);
    });

    it('should return false when no permit required', () => {
      const registration: RegistrationData = {
        city: { fee: 100 },
      };
      expect(isPermitRequired(registration)).toBe(false);
    });

    it('should return false for null input', () => {
      expect(isPermitRequired(null)).toBe(false);
    });
  });

  describe('getTotalTaxRate()', () => {
    it('should return city total tax rate when present', () => {
      expect(
        getTotalTaxRate({ total_tax_rate_city: 15.5, state_sales_tax: null, total_tax_rate_county: null })
      ).toBe(15.5);
    });

    it('should fall back to county rate when city is null', () => {
      expect(
        getTotalTaxRate({ total_tax_rate_city: null, total_tax_rate_county: 12.0, state_sales_tax: null })
      ).toBe(12.0);
    });

    it('should return null when no rates present', () => {
      expect(getTotalTaxRate({ state_sales_tax: 6.0, total_tax_rate_city: null, total_tax_rate_county: null })).toBeNull();
    });

    it('should return null for null input', () => {
      expect(getTotalTaxRate(null)).toBeNull();
    });
  });

  describe('formatTaxRate()', () => {
    it('should format rate as percentage', () => {
      expect(formatTaxRate(15.5)).toBe('15.5%');
      expect(formatTaxRate(10)).toBe('10.0%');
    });

    it('should return null for null input', () => {
      expect(formatTaxRate(null)).toBeNull();
    });
  });

  describe('formatCurrency()', () => {
    it('should format as USD currency', () => {
      expect(formatCurrency(500)).toBe('$500');
      expect(formatCurrency(1500)).toBe('$1,500');
    });

    it('should return null for null input', () => {
      expect(formatCurrency(null)).toBeNull();
    });
  });

  describe('deriveStrictness()', () => {
    it('should return permissive for null regulation', () => {
      expect(deriveStrictness(null)).toBe('permissive');
    });

    it('should return permissive for empty regulation', () => {
      expect(deriveStrictness({})).toBe('permissive');
    });

    it('should return strict when multiple high-strictness factors present', () => {
      const regulation: Partial<Regulation> = {
        registration: {
          city: { fee: 600, required: true, primary_residence_required: true },
        },
        limits: {
          city: { nights_per_year: 90 },
        },
        penalties: {
          city: { max_fine: 15000 },
        },
      };
      expect(deriveStrictness(regulation)).toBe('strict');
    });

    it('should return moderate for medium strictness factors', () => {
      const regulation: Partial<Regulation> = {
        registration: {
          city: { fee: 200, required: true },
        },
        penalties: {
          city: { max_fine: 2000 },
        },
      };
      expect(deriveStrictness(regulation)).toBe('moderate');
    });

    it('should return permissive for low strictness factors', () => {
      const regulation: Partial<Regulation> = {
        registration: {
          city: { fee: 50 },
        },
      };
      expect(deriveStrictness(regulation)).toBe('permissive');
    });
  });

  describe('extractPublicFlags()', () => {
    it('should extract flags from regulation', () => {
      const regulation: Partial<Regulation> = {
        registration: {
          city: { required: true },
        },
        limits: {
          city: { nights_per_year: 90 },
        },
        eligibility: {
          primary_residence_required: true,
        } as any,
        taxes: {
          total_tax_rate_city: 15.5,
          state_sales_tax: null,
          total_tax_rate_county: null,
        },
      };

      const flags = extractPublicFlags(regulation, 5);
      expect(flags.permitRequired).toBe(true);
      expect(flags.nightLimitsApply).toBe(true);
      expect(flags.primaryResidenceOnly).toBe(true);
      expect(flags.totalTaxRate).toBe('15.5%');
      expect(flags.gotchaCount).toBe(5);
    });

    it('should return defaults for null regulation', () => {
      const flags = extractPublicFlags(null);
      expect(flags.permitRequired).toBe(false);
      expect(flags.nightLimitsApply).toBe(false);
      expect(flags.primaryResidenceOnly).toBe(false);
      expect(flags.totalTaxRate).toBeNull();
      expect(flags.gotchaCount).toBe(0);
    });
  });

  describe('STATE_NAMES', () => {
    it('should have all 50 states plus territories', () => {
      expect(Object.keys(STATE_NAMES).length).toBeGreaterThanOrEqual(50);
    });

    it('should map state codes to names', () => {
      expect(STATE_NAMES['CA']).toBe('California');
      expect(STATE_NAMES['NY']).toBe('New York');
      expect(STATE_NAMES['TX']).toBe('Texas');
      expect(STATE_NAMES['FL']).toBe('Florida');
    });
  });

  describe('getStateName()', () => {
    it('should return state name for valid code', () => {
      expect(getStateName('CA')).toBe('California');
      expect(getStateName('ca')).toBe('California');
    });

    it('should return code for unknown state', () => {
      expect(getStateName('XX')).toBe('XX');
    });
  });

  describe('groupByState()', () => {
    it('should group items by state', () => {
      const items = [
        { state_code: 'CA', state_name: 'California', name: 'LA' },
        { state_code: 'CA', state_name: 'California', name: 'SF' },
        { state_code: 'NY', state_name: 'New York', name: 'NYC' },
      ];

      const groups = groupByState(items);
      expect(groups.size).toBe(2);
      expect(groups.get('CA')?.items).toHaveLength(2);
      expect(groups.get('NY')?.items).toHaveLength(1);
    });

    it('should sort groups alphabetically by state name', () => {
      const items = [
        { state_code: 'NY', state_name: 'New York', name: 'NYC' },
        { state_code: 'CA', state_name: 'California', name: 'LA' },
      ];

      const groups = groupByState(items);
      const keys = [...groups.keys()];
      expect(keys[0]).toBe('CA');
      expect(keys[1]).toBe('NY');
    });
  });

  describe('formatConfidence()', () => {
    it('should format score as percentage', () => {
      expect(formatConfidence(0.95)).toBe('95%');
      expect(formatConfidence(0.875)).toBe('88%');
    });

    it('should return N/A for null', () => {
      expect(formatConfidence(null)).toBe('N/A');
    });
  });

  describe('getPermitName()', () => {
    it('should return city permit name when present', () => {
      const registration: RegistrationData = {
        city: { permit_name: 'STR Business License' },
      };
      expect(getPermitName(registration)).toBe('STR Business License');
    });

    it('should fall back to county permit name', () => {
      const registration: RegistrationData = {
        county: { permit_name: 'County STR Permit' },
      };
      expect(getPermitName(registration)).toBe('County STR Permit');
    });

    it('should return default for null', () => {
      expect(getPermitName(null)).toBe('STR Permit');
    });
  });

  describe('getProcessingTime()', () => {
    it('should return city processing time', () => {
      const registration: RegistrationData = {
        city: { processing_time: '2-4 weeks' },
      };
      expect(getProcessingTime(registration)).toBe('2-4 weeks');
    });

    it('should return null when not present', () => {
      const registration: RegistrationData = {
        city: { fee: 100 },
      };
      expect(getProcessingTime(registration)).toBeNull();
    });
  });

  describe('getRequiredDocuments()', () => {
    it('should return combined documents from city and county', () => {
      const registration: RegistrationData = {
        city: { required_documents: ['ID', 'Proof of Ownership'] },
        county: { required_documents: ['Insurance', 'ID'] },
      };
      const docs = getRequiredDocuments(registration);
      expect(docs).toContain('ID');
      expect(docs).toContain('Proof of Ownership');
      expect(docs).toContain('Insurance');
      // Should dedupe
      expect(docs.filter((d) => d === 'ID')).toHaveLength(1);
    });

    it('should return empty array for null', () => {
      expect(getRequiredDocuments(null)).toEqual([]);
    });
  });
});
