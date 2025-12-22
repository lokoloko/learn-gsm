/**
 * Category slug mapping utility
 *
 * The database uses Title Case with spaces (e.g., "Getting Started")
 * URLs use kebab-case (e.g., "getting-started")
 */

// Database category values (Title Case)
export type CategoryValue =
  | 'Getting Started'
  | 'Your Listing'
  | 'Pricing & Profitability'
  | 'Hosting Operations'
  | 'Regulations & Compliance'
  | 'Growth & Marketing';

// URL slugs (kebab-case)
export type CategorySlug =
  | 'getting-started'
  | 'your-listing'
  | 'pricing-profitability'
  | 'hosting-operations'
  | 'regulations-compliance'
  | 'growth-marketing';

// Mapping: DB value -> URL slug
export const CATEGORY_SLUGS: Record<CategoryValue, CategorySlug> = {
  'Getting Started': 'getting-started',
  'Your Listing': 'your-listing',
  'Pricing & Profitability': 'pricing-profitability',
  'Hosting Operations': 'hosting-operations',
  'Regulations & Compliance': 'regulations-compliance',
  'Growth & Marketing': 'growth-marketing',
};

// Reverse mapping: URL slug -> DB value
export const SLUG_TO_CATEGORY: Record<CategorySlug, CategoryValue> = {
  'getting-started': 'Getting Started',
  'your-listing': 'Your Listing',
  'pricing-profitability': 'Pricing & Profitability',
  'hosting-operations': 'Hosting Operations',
  'regulations-compliance': 'Regulations & Compliance',
  'growth-marketing': 'Growth & Marketing',
};

// All category slugs for static path generation
export const ALL_CATEGORY_SLUGS: CategorySlug[] = [
  'getting-started',
  'your-listing',
  'pricing-profitability',
  'hosting-operations',
  'regulations-compliance',
  'growth-marketing',
];

// Category metadata for display
export const CATEGORY_META: Record<CategorySlug, { name: string; description: string; icon: string }> = {
  'getting-started': {
    name: 'Getting Started',
    description: 'First property, platform basics, initial setup for new STR hosts',
    icon: 'rocket',
  },
  'your-listing': {
    name: 'Your Listing',
    description: 'Photos, descriptions, amenities, staging and optimization',
    icon: 'home',
  },
  'pricing-profitability': {
    name: 'Pricing & Profitability',
    description: 'Rates, expenses, bookkeeping, taxes and revenue management',
    icon: 'dollar-sign',
  },
  'hosting-operations': {
    name: 'Hosting Operations',
    description: 'Cleaning, maintenance, guest communication and day-to-day hosting',
    icon: 'settings',
  },
  'regulations-compliance': {
    name: 'Regulations & Compliance',
    description: 'Laws, permits, insurance, LLC and legal considerations',
    icon: 'shield',
  },
  'growth-marketing': {
    name: 'Growth & Marketing',
    description: 'Direct booking, scaling, automation and marketing strategies',
    icon: 'trending-up',
  },
};

/**
 * Convert database category value to URL slug
 */
export function categoryToSlug(category: string | null): string {
  if (!category) return '';
  return CATEGORY_SLUGS[category as CategoryValue] || category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
}

/**
 * Convert URL slug to database category value
 */
export function slugToCategory(slug: string): string {
  return SLUG_TO_CATEGORY[slug as CategorySlug] || slug;
}

/**
 * Check if a string is a valid category slug
 */
export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return ALL_CATEGORY_SLUGS.includes(slug as CategorySlug);
}
