/**
 * SHARED CONTENT - Single Source of Truth
 *
 * Copy this file to all GoStudioM apps to maintain consistency:
 * - gostudiom.com (Clean Calendar)
 * - listings.gostudiom.com (Listing Analyzer)
 * - analytics.gostudiom.com (Financial Analytics)
 *
 * Last updated: December 8, 2025
 */

// ============================================
// PRICING
// ============================================

export const PRICING = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    properties: 1,
    description: 'Try before you buy',
    features: [
      '1 property',
      '1 listing analysis',
      '1 listing financial analytics',
      'Competitor tracking (3/listing)',
      'Manual schedule only',
      'No exports',
    ],
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 14.99,
    annualPrice: 12.42, // ~$149/year, 2 months free
    annualTotal: 149,
    properties: 10,
    description: 'All 3 tools • 10 properties',
    features: [
      '10 properties across all tools',
      '10 listing analyses/month',
      '20 financial uploads/month',
      'SMS automation included',
      'Excel export',
    ],
    badge: 'Most Popular',
    highlighted: true,
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 29.99,
    annualPrice: 24.92, // ~$299/year, 2 months free
    annualTotal: 299,
    properties: 25,
    description: 'All 3 tools • 25 properties',
    features: [
      '25 properties across all tools',
      'Unlimited listing analyses',
      'Unlimited financial uploads',
      'Unlimited competitor tracking',
      'Everything in Starter',
      'AI-powered insights',
      'Priority support',
    ],
  },
} as const

// ============================================
// PRODUCTS
// ============================================

export const PRODUCTS = {
  listingAnalyzer: {
    name: 'Listing Analyzer',
    tagline: 'Free AI analysis to optimize your Airbnb listing for more bookings',
    url: 'https://listings.gostudiom.com',
    features: [
      '0-100 listing score',
      '50+ factors analyzed',
      'Actionable insights',
      'Competitor discovery',
      'Takes 30 seconds',
    ],
    cta: 'Analyze Free',
    color: 'purple',
  },
  cleaningCalendar: {
    name: 'Cleaning Calendar',
    tagline: 'Automate your cleaning schedule with smart SMS reminders',
    url: 'https://gostudiom.com/dashboard',
    features: [
      'Auto-sync with Airbnb',
      'SMS reminders included',
      'Cleaner self-service portal',
      'Change notifications',
      '85% cheaper than competition',
    ],
    cta: 'Get Started Free',
    color: 'primary',
    highlighted: true,
  },
  financialAnalytics: {
    name: 'Financial Analytics',
    tagline: 'Know your numbers with comprehensive revenue tracking',
    url: 'https://analytics.gostudiom.com',
    features: [
      'CSV & PDF import',
      'Revenue dashboards',
      'Tax-ready reports',
      'Excel export',
      'AI-powered insights',
    ],
    cta: 'Upload Your Data',
    color: 'amber',
  },
} as const

// ============================================
// TRUST SIGNALS
// ============================================

export const TRUST_SIGNALS = {
  yearsHosting: 8,
  propertiesManaged: 21,
  hoursSavedWeekly: '3+',
  savingsVsCompetition: '85%',
  tagline: 'Built for hosts, by a host',
} as const

// ============================================
// NAVIGATION
// ============================================

// Standard nav links for all GoStudioM apps
// Order: Calendar, Analyzer, Analytics, Pricing (logo serves as Home)
// Sign In goes to /dashboard (will redirect to login if not authenticated)
export const NAV_LINKS = [
  { label: 'Calendar', href: 'https://gostudiom.com' },
  { label: 'Analyzer', href: 'https://listings.gostudiom.com' },
  { label: 'Analytics', href: 'https://analytics.gostudiom.com' },
  { label: 'Pricing', href: 'https://gostudiom.com/#pricing' },
] as const

// Sign in goes to login page, which redirects to /dashboard after authentication
export const SIGN_IN_HREF = '/auth/login'

// ============================================
// FOOTER LINKS - Product-Centric Structure
// ============================================

// Product columns with their associated free tools
export const FOOTER_PRODUCT_COLUMNS = {
  listingAnalyzer: {
    title: 'Listing Analyzer',
    mainLink: { label: 'Get Listing Score', href: 'https://listings.gostudiom.com' },
    tools: [
      { label: 'Title Generator', href: 'https://listings.gostudiom.com/tools/generator' },
      { label: 'Review Responder', href: 'https://listings.gostudiom.com/tools/review-response' },
      { label: 'Guest Review Writer', href: 'https://listings.gostudiom.com/tools/guest-review' },
    ],
    cta: { label: 'All Listing Tools →', href: 'https://listings.gostudiom.com/tools#listing' },
  },
  cleaningCalendar: {
    title: 'Cleaning Calendar',
    mainLink: { label: 'Try Calendar Free', href: 'https://gostudiom.com' },
    tools: [
      { label: 'Superhost Calculator', href: 'https://listings.gostudiom.com/tools/superhost-calculator' },
      { label: 'Maintenance Planner', href: 'https://listings.gostudiom.com/tools/maintenance-schedule' },
    ],
    cta: { label: 'All Operations Tools →', href: 'https://listings.gostudiom.com/tools#operations' },
  },
  financialAnalytics: {
    title: 'Financial Analytics',
    mainLink: { label: 'See Your Numbers', href: 'https://analytics.gostudiom.com' },
    tools: [
      { label: 'Fee Calculator', href: 'https://listings.gostudiom.com/tools/fee-calculator' },
      { label: 'Special Offer Calculator', href: 'https://listings.gostudiom.com/tools/special-offer-calculator' },
    ],
    cta: { label: 'All Financial Tools →', href: 'https://listings.gostudiom.com/tools#financial' },
  },
  learn: {
    title: 'Learn',
    mainLink: { label: 'Videos', href: 'https://learn.gostudiom.com/videos', noHighlight: true },
    tools: [
      { label: 'News', href: 'https://learn.gostudiom.com/news' },
      { label: 'Topics', href: 'https://learn.gostudiom.com/topics' },
    ],
    cta: { label: 'Ask AI →', href: 'https://learn.gostudiom.com/chat' },
  },
} as const

// Legacy footer links structure (for backwards compatibility)
export const FOOTER_LINKS = {
  products: [
    { label: 'Listing Analyzer', href: 'https://listings.gostudiom.com' },
    { label: 'Cleaning Calendar', href: 'https://gostudiom.com/dashboard' },
    { label: 'Financial Analytics', href: 'https://analytics.gostudiom.com' },
  ],
  freeTools: [
    { label: 'All Free Tools', href: 'https://listings.gostudiom.com/tools' },
    { label: 'Listing Analyzer', href: 'https://listings.gostudiom.com' },
    { label: 'Title Generator', href: 'https://listings.gostudiom.com/tools/generator' },
    { label: 'Review Responder', href: 'https://listings.gostudiom.com/tools/review-response' },
    { label: 'Guest Review Writer', href: 'https://listings.gostudiom.com/tools/guest-review' },
    { label: 'Superhost Calculator', href: 'https://listings.gostudiom.com/tools/superhost-calculator' },
    { label: 'Maintenance Planner', href: 'https://listings.gostudiom.com/tools/maintenance-schedule' },
    { label: 'Fee Calculator', href: 'https://listings.gostudiom.com/tools/fee-calculator' },
    { label: 'Special Offer Calculator', href: 'https://listings.gostudiom.com/tools/special-offer-calculator' },
  ],
  compare: [
    { label: 'Best Cleaning Software', href: 'https://gostudiom.com/best-airbnb-cleaning-software' },
    { label: 'Turno Alternative', href: 'https://gostudiom.com/turno-alternative' },
    { label: 'Properly Alternative', href: 'https://gostudiom.com/properly-alternative' },
    { label: 'Hospitable Alternative', href: 'https://gostudiom.com/hospitable-alternative' },
    { label: 'AirDNA Alternative', href: 'https://gostudiom.com/airdna-alternative' },
  ],
  legal: [
    { label: 'Privacy Policy', href: 'https://gostudiom.com/privacy' },
    { label: 'Terms of Service', href: 'https://gostudiom.com/terms' },
    { label: 'SMS Consent', href: 'https://gostudiom.com/sms-consent' },
    { label: 'Contact Us', href: 'https://gostudiom.com/contact' },
  ],
} as const

// ============================================
// COMPETITOR PRICING (Last verified: Dec 8, 2025)
// ============================================

export const COMPETITOR_PRICING = {
  turno: {
    name: 'Turno',
    perProperty: 8, // $8/property/mo
    freeProperties: 1,
    lastVerified: '2025-12-08',
    source: 'https://turno.com/pricing/',
  },
  properly: {
    name: 'Properly',
    perProperty: 5.40, // estimated
    lastVerified: null, // no public pricing found
    source: 'https://getproperly.com/',
  },
  hospitable: {
    name: 'Hospitable',
    plans: {
      host: { base: 29, perExtra: 10, included: 1 },
      professional: { base: 59, perExtra: 15, included: 2 },
      mogul: { base: 99, perExtra: 30, included: 3 },
    },
    lastVerified: '2025-12-08',
    source: 'https://hospitable.com/pricing',
  },
  airdna: {
    name: 'AirDNA',
    range: '$12-599/mo',
    lastVerified: null,
    source: 'https://www.airdna.co/pricing',
  },
} as const

// ============================================
// COMMON CTAs
// ============================================

export const CTAS = {
  analyzeFreePrimary: {
    text: 'Analyze Free',
    href: 'https://listings.gostudiom.com',
  },
  tryCalendarFree: {
    text: 'Try Calendar Free',
    href: 'https://gostudiom.com/dashboard',
  },
  uploadData: {
    text: 'Upload Your Data',
    href: 'https://analytics.gostudiom.com',
  },
  signIn: {
    text: 'Sign In',
    href: 'https://gostudiom.com/dashboard',
  },
  getStarted: {
    text: 'Get Started',
    href: 'https://gostudiom.com/signup',
  },
} as const

// ============================================
// MESSAGING
// ============================================

export const MESSAGING = {
  hero: {
    headline: 'Host Smarter, Not Harder',
    subheadline: 'Stop texting cleaners, wondering why competitors rank higher, and scrambling at tax time.',
  },
  valueProps: [
    {
      title: 'Save 3+ hours weekly',
      description: 'Automate repetitive tasks',
    },
    {
      title: '85% cheaper than alternatives',
      description: '$14.99/mo vs $80/mo for 10 properties',
    },
    {
      title: 'All-in-one platform',
      description: "No more juggling 5 different tools",
    },
  ],
  guarantees: [
    'No credit card required',
    '30-day money-back guarantee',
  ],
} as const
