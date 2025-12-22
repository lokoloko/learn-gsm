import {
  CATEGORY_SLUGS,
  SLUG_TO_CATEGORY,
  ALL_CATEGORY_SLUGS,
  CATEGORY_META,
  categoryToSlug,
  slugToCategory,
  isValidCategorySlug,
  type CategoryValue,
  type CategorySlug,
} from '@/lib/utils/categories';

describe('categories utility', () => {
  describe('CATEGORY_SLUGS mapping', () => {
    it('should have all 6 categories', () => {
      expect(Object.keys(CATEGORY_SLUGS)).toHaveLength(6);
    });

    it('should map Title Case to kebab-case correctly', () => {
      expect(CATEGORY_SLUGS['Getting Started']).toBe('getting-started');
      expect(CATEGORY_SLUGS['Your Listing']).toBe('your-listing');
      expect(CATEGORY_SLUGS['Pricing & Profitability']).toBe('pricing-profitability');
      expect(CATEGORY_SLUGS['Hosting Operations']).toBe('hosting-operations');
      expect(CATEGORY_SLUGS['Regulations & Compliance']).toBe('regulations-compliance');
      expect(CATEGORY_SLUGS['Growth & Marketing']).toBe('growth-marketing');
    });
  });

  describe('SLUG_TO_CATEGORY mapping', () => {
    it('should have all 6 slugs', () => {
      expect(Object.keys(SLUG_TO_CATEGORY)).toHaveLength(6);
    });

    it('should map kebab-case to Title Case correctly', () => {
      expect(SLUG_TO_CATEGORY['getting-started']).toBe('Getting Started');
      expect(SLUG_TO_CATEGORY['your-listing']).toBe('Your Listing');
      expect(SLUG_TO_CATEGORY['pricing-profitability']).toBe('Pricing & Profitability');
      expect(SLUG_TO_CATEGORY['hosting-operations']).toBe('Hosting Operations');
      expect(SLUG_TO_CATEGORY['regulations-compliance']).toBe('Regulations & Compliance');
      expect(SLUG_TO_CATEGORY['growth-marketing']).toBe('Growth & Marketing');
    });

    it('should be the inverse of CATEGORY_SLUGS', () => {
      Object.entries(CATEGORY_SLUGS).forEach(([category, slug]) => {
        expect(SLUG_TO_CATEGORY[slug as CategorySlug]).toBe(category);
      });
    });
  });

  describe('ALL_CATEGORY_SLUGS', () => {
    it('should contain all 6 slugs', () => {
      expect(ALL_CATEGORY_SLUGS).toHaveLength(6);
    });

    it('should contain all expected slugs', () => {
      expect(ALL_CATEGORY_SLUGS).toContain('getting-started');
      expect(ALL_CATEGORY_SLUGS).toContain('your-listing');
      expect(ALL_CATEGORY_SLUGS).toContain('pricing-profitability');
      expect(ALL_CATEGORY_SLUGS).toContain('hosting-operations');
      expect(ALL_CATEGORY_SLUGS).toContain('regulations-compliance');
      expect(ALL_CATEGORY_SLUGS).toContain('growth-marketing');
    });
  });

  describe('CATEGORY_META', () => {
    it('should have metadata for all slugs', () => {
      ALL_CATEGORY_SLUGS.forEach((slug) => {
        expect(CATEGORY_META[slug]).toBeDefined();
        expect(CATEGORY_META[slug].name).toBeDefined();
        expect(CATEGORY_META[slug].description).toBeDefined();
        expect(CATEGORY_META[slug].icon).toBeDefined();
      });
    });

    it('should have correct names matching category values', () => {
      expect(CATEGORY_META['getting-started'].name).toBe('Getting Started');
      expect(CATEGORY_META['your-listing'].name).toBe('Your Listing');
      expect(CATEGORY_META['pricing-profitability'].name).toBe('Pricing & Profitability');
    });

    it('should have non-empty descriptions', () => {
      ALL_CATEGORY_SLUGS.forEach((slug) => {
        expect(CATEGORY_META[slug].description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('categoryToSlug()', () => {
    it('should convert known categories to slugs', () => {
      expect(categoryToSlug('Getting Started')).toBe('getting-started');
      expect(categoryToSlug('Your Listing')).toBe('your-listing');
      expect(categoryToSlug('Pricing & Profitability')).toBe('pricing-profitability');
    });

    it('should handle null input', () => {
      expect(categoryToSlug(null)).toBe('');
    });

    it('should handle unknown categories by converting to lowercase with hyphens', () => {
      expect(categoryToSlug('Unknown Category')).toBe('unknown-category');
      expect(categoryToSlug('Some New Category')).toBe('some-new-category');
    });

    it('should remove ampersands from unknown categories', () => {
      expect(categoryToSlug('Test & Category')).toBe('test--category');
    });
  });

  describe('slugToCategory()', () => {
    it('should convert known slugs to categories', () => {
      expect(slugToCategory('getting-started')).toBe('Getting Started');
      expect(slugToCategory('your-listing')).toBe('Your Listing');
      expect(slugToCategory('pricing-profitability')).toBe('Pricing & Profitability');
    });

    it('should return the slug unchanged for unknown slugs', () => {
      expect(slugToCategory('unknown-slug')).toBe('unknown-slug');
      expect(slugToCategory('some-other-value')).toBe('some-other-value');
    });
  });

  describe('isValidCategorySlug()', () => {
    it('should return true for valid slugs', () => {
      ALL_CATEGORY_SLUGS.forEach((slug) => {
        expect(isValidCategorySlug(slug)).toBe(true);
      });
    });

    it('should return false for invalid slugs', () => {
      expect(isValidCategorySlug('invalid-slug')).toBe(false);
      expect(isValidCategorySlug('Getting Started')).toBe(false);
      expect(isValidCategorySlug('')).toBe(false);
      expect(isValidCategorySlug('getting started')).toBe(false);
    });
  });
});
