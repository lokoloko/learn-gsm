/**
 * Regulations utility functions
 *
 * Provides strictness derivation, boolean flag extraction, and formatting
 * helpers for regulation data display.
 */

import type {
  Regulation,
  RegistrationData,
  PenaltiesData,
  LimitsData,
  EligibilityData,
  TaxesData,
  JurisdictionForDirectory,
} from '@/types/database';

// ============================================================================
// STRICTNESS LEVELS
// ============================================================================

export type StrictnessLevel = 'strict' | 'moderate' | 'permissive';

export const STRICTNESS_META: Record<
  StrictnessLevel,
  { label: string; color: string; bgColor: string; description: string }
> = {
  strict: {
    label: 'Strict',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'Heavy restrictions on STR operations',
  },
  moderate: {
    label: 'Moderate',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Some restrictions with clear permit process',
  },
  permissive: {
    label: 'Permissive',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    description: 'Relatively few restrictions on STR operations',
  },
};

/**
 * Extract numeric fee from registration data.
 * Handles city and county levels.
 */
export function extractFee(registration: RegistrationData | null): number | null {
  if (!registration) return null;
  return registration.city?.fee ?? registration.county?.fee ?? null;
}

/**
 * Extract maximum fine from penalties data.
 * Checks both city and county levels.
 */
export function extractMaxFine(penalties: PenaltiesData | null): number | null {
  if (!penalties) return null;
  const cityFine = penalties.city?.max_fine ?? 0;
  const countyFine = penalties.county?.max_fine ?? 0;
  const max = Math.max(cityFine, countyFine);
  return max > 0 ? max : null;
}

/**
 * Check if night caps apply (annual limits on rental nights).
 */
export function hasNightCap(limits: LimitsData | null): boolean {
  if (!limits) return false;
  return (
    limits.city?.nights_per_year != null || limits.county?.nights_per_year != null
  );
}

/**
 * Check if primary residence is required.
 */
export function isPrimaryResidenceRequired(
  eligibility: EligibilityData | null,
  registration: RegistrationData | null
): boolean {
  if (eligibility?.primary_residence_required) return true;
  if (registration?.city?.primary_residence_required) return true;
  if (registration?.county?.primary_residence_required) return true;
  return false;
}

/**
 * Check if permit/license is required.
 */
export function isPermitRequired(registration: RegistrationData | null): boolean {
  if (!registration) return false;
  return registration.city?.required === true || registration.county?.required === true;
}

/**
 * Get total tax rate (prefer city, fall back to county).
 */
export function getTotalTaxRate(taxes: TaxesData | null): number | null {
  if (!taxes) return null;
  return taxes.total_tax_rate_city ?? taxes.total_tax_rate_county ?? null;
}

/**
 * Format tax rate as percentage string.
 */
export function formatTaxRate(rate: number | null): string | null {
  if (rate == null) return null;
  return `${rate.toFixed(1)}%`;
}

/**
 * Format currency amount.
 */
export function formatCurrency(amount: number | null): string | null {
  if (amount == null) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Derive strictness level from regulation data.
 *
 * Uses a scoring system based on:
 * - Permit fees (high fees = stricter)
 * - Night caps (any = stricter)
 * - Primary residence requirement (yes = stricter)
 * - Penalty amounts ($10k+ = strict)
 *
 * @param regulation - Full regulation object with JSONB fields
 * @returns StrictnessLevel - 'strict', 'moderate', or 'permissive'
 */
export function deriveStrictness(regulation: Partial<Regulation> | null): StrictnessLevel {
  if (!regulation) return 'permissive';

  let score = 0;

  // Check registration fees (high fees = stricter)
  const fee = extractFee(regulation.registration ?? null);
  if (fee && fee > 500) score += 2;
  else if (fee && fee > 100) score += 1;

  // Check night caps (any = stricter)
  if (hasNightCap(regulation.limits ?? null)) score += 2;

  // Check primary residence requirement (yes = stricter)
  if (isPrimaryResidenceRequired(regulation.eligibility ?? null, regulation.registration ?? null)) {
    score += 2;
  }

  // Check penalty amounts ($10k+ = strict)
  const maxFine = extractMaxFine(regulation.penalties ?? null);
  if (maxFine && maxFine >= 10000) score += 2;
  else if (maxFine && maxFine >= 1000) score += 1;

  // Check if permit is required (adds some strictness)
  if (isPermitRequired(regulation.registration ?? null)) score += 1;

  // Determine strictness level
  if (score >= 5) return 'strict';
  if (score >= 2) return 'moderate';
  return 'permissive';
}

// ============================================================================
// PUBLIC FLAGS (for SEO tier)
// ============================================================================

export interface RegulationFlags {
  permitRequired: boolean;
  nightLimitsApply: boolean;
  primaryResidenceOnly: boolean;
  totalTaxRate: string | null;
  gotchaCount: number;
}

/**
 * Extract boolean flags for public tier display.
 * These are shown on the SEO layer without requiring login.
 */
export function extractPublicFlags(
  regulation: Partial<Regulation> | null,
  gotchaCount: number = 0
): RegulationFlags {
  if (!regulation) {
    return {
      permitRequired: false,
      nightLimitsApply: false,
      primaryResidenceOnly: false,
      totalTaxRate: null,
      gotchaCount: 0,
    };
  }

  const taxRate = getTotalTaxRate(regulation.taxes ?? null);

  return {
    permitRequired: isPermitRequired(regulation.registration ?? null),
    nightLimitsApply: hasNightCap(regulation.limits ?? null),
    primaryResidenceOnly: isPrimaryResidenceRequired(
      regulation.eligibility ?? null,
      regulation.registration ?? null
    ),
    totalTaxRate: formatTaxRate(taxRate),
    gotchaCount,
  };
}

// ============================================================================
// DIRECTORY HELPERS
// ============================================================================

/**
 * Derive strictness for directory listing items.
 */
export function getDirectoryItemStrictness(
  item: JurisdictionForDirectory
): StrictnessLevel {
  if (!item.regulation) return 'permissive';
  return deriveStrictness(item.regulation);
}

// ============================================================================
// STATE HELPERS
// ============================================================================

/**
 * Get state name from state code.
 * Returns the code itself if not found (shouldn't happen with valid data).
 */
export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
  PR: 'Puerto Rico',
  VI: 'Virgin Islands',
  GU: 'Guam',
};

export function getStateName(stateCode: string): string {
  return STATE_NAMES[stateCode.toUpperCase()] || stateCode;
}

/**
 * Group jurisdictions by state.
 */
export function groupByState<T extends { state_code: string; state_name: string }>(
  items: T[]
): Map<string, { stateName: string; items: T[] }> {
  const groups = new Map<string, { stateName: string; items: T[] }>();

  for (const item of items) {
    const key = item.state_code;
    if (!groups.has(key)) {
      groups.set(key, { stateName: item.state_name, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  // Sort groups by state name
  return new Map(
    [...groups.entries()].sort((a, b) => a[1].stateName.localeCompare(b[1].stateName))
  );
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format confidence score as percentage.
 */
export function formatConfidence(score: number | null): string {
  if (score == null) return 'N/A';
  return `${Math.round(score * 100)}%`;
}

/**
 * Truncate summary for public tier (1-2 sentences).
 * Attempts to find sentence boundaries for clean truncation.
 */
export function truncateSummary(summary: string | null, maxLength: number = 150): string | null {
  if (!summary) return null;

  // If already short enough, return as-is
  if (summary.length <= maxLength) return summary;

  // Try to truncate at sentence boundary
  const sentences = summary.match(/[^.!?]+[.!?]+/g) || [];

  let result = '';
  for (const sentence of sentences) {
    if ((result + sentence).length <= maxLength) {
      result += sentence;
    } else {
      break;
    }
  }

  // If we got at least one sentence, use it
  if (result.length > 0) {
    return result.trim();
  }

  // Fallback: truncate at word boundary
  const truncated = summary.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Check if STRs are allowed in this jurisdiction.
 * Returns false if explicitly prohibited, true otherwise.
 */
export function areSTRsAllowed(regulation: Partial<Regulation> | null): boolean {
  if (!regulation) return true; // Assume allowed if no data

  // Check if status indicates prohibition
  if (regulation.status === 'prohibited' || regulation.status === 'banned') {
    return false;
  }

  // Check if registration explicitly says not allowed
  if (
    regulation.registration?.city?.allowed === false ||
    regulation.registration?.county?.allowed === false
  ) {
    return false;
  }

  return true;
}

/**
 * Get permit/license name or default.
 */
export function getPermitName(registration: RegistrationData | null): string {
  if (!registration) return 'STR Permit';
  return (
    registration.city?.permit_name ||
    registration.county?.permit_name ||
    'STR Permit'
  );
}

/**
 * Get processing time for permit.
 */
export function getProcessingTime(registration: RegistrationData | null): string | null {
  if (!registration) return null;
  return registration.city?.processing_time || registration.county?.processing_time || null;
}

/**
 * Get required documents list.
 */
export function getRequiredDocuments(registration: RegistrationData | null): string[] {
  if (!registration) return [];
  const cityDocs = registration.city?.required_documents || [];
  const countyDocs = registration.county?.required_documents || [];
  // Combine and dedupe
  return [...new Set([...cityDocs, ...countyDocs])];
}
