-- Generated Benchmark Tables for Listing Analyzer
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Industry Benchmarks Table
-- ============================================

CREATE TABLE IF NOT EXISTS listings.industry_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL UNIQUE,
  threshold_poor numeric,
  threshold_good numeric,
  threshold_excellent numeric,
  source_description text,
  expert_mentions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed with extracted benchmarks (customize based on research)
INSERT INTO listings.industry_benchmarks (metric, threshold_poor, threshold_good, threshold_excellent, source_description, expert_mentions)
VALUES
  ('photo_count', 15, 25, 40, 'Top performers have 30-50+ photos', 2),
  ('review_count_credibility', 3, 10, 50, 'Credibility threshold is 10+ reviews', 0),
  ('response_rate_pct', 80, 90, 98, 'Superhost requires 90%+', 4),
  ('overall_rating', 4.5, 4.7, 4.9, 'Guest Favorite threshold is 4.9+', 0),
  ('cleaning_fee_ratio_max', 0.6, 0.4, 0.25, 'Cleaning fee should be <40% of nightly rate', 1),
  ('min_stay_urban_max', 5, 2, 1, 'Urban markets: 2+ nights limits bookings', 4)
ON CONFLICT (metric) DO UPDATE SET
  source_description = EXCLUDED.source_description,
  expert_mentions = EXCLUDED.expert_mentions,
  updated_at = now();

-- ============================================
-- 2. Amenity Importance Table
-- ============================================

CREATE TABLE IF NOT EXISTS listings.amenity_importance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amenity_name text NOT NULL,
  normalized_name text NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('essential', 'high_impact', 'nice_to_have', 'premium')),
  mention_count integer DEFAULT 0,
  sample_insight text,
  created_at timestamptz DEFAULT now()
);

-- Seed with extracted amenity importance
INSERT INTO listings.amenity_importance (amenity_name, normalized_name, tier, mention_count, sample_insight)
VALUES
  ('fire', 'fire_pit', 'essential', 54, 'Guests are willing to pay premium nightly rates for luxury cabin experiences with amenities like hot tubs, fire pits, and outdoor living in Broken Bow.'),
  ('coffee', 'coffee_maker', 'high_impact', 42, 'All-in-one kitchen units combine a coffee maker, oven, and stovetop for efficient use of counter space.'),
  ('kitchen', 'kitchen', 'high_impact', 33, 'Consider adding multiple ovens to your kitchen for larger groups to provide the flexibility to cook for large groups.'),
  ('pool', 'pool', 'premium', 18, 'Unique amenities like pickleball courts, swimming pools, and ping-pong tables enhance a property''s appeal.'),
  ('wifi', 'wifi', 'nice_to_have', 13, 'Install Starlink WiFi in remote locations to attract guests who need reliable internet.'),
  ('smart', 'self_check_in', 'nice_to_have', 12, 'Keyless entry smart lock.'),
  ('wifi', 'wifi', 'nice_to_have', 10, 'Even with smart technology, it''s essential to have a backup plan, such as a hidden key, in case of power outages or WiFi issues.'),
  ('workspace', 'dedicated_workspace', 'nice_to_have', 8, 'New trends like remote work may increase demand for vacation rentals if digital nomads continue seeking alternative workspaces.'),
  ('pet', 'pet_friendly', 'nice_to_have', 7, 'Offering a pet-friendly stay allows guests to travel with their pet instead of paying for a dog sitter or boarding facility.'),
  ('air', 'climate_control', 'nice_to_have', 5, 'Heating and/or air conditioning are critical for guest comfort, regardless of property type or location.'),
  ('tv', 'streaming', 'nice_to_have', 5, 'Having a TV with over-the-air channels or streaming services such as Netflix and Hulu in the living room has become something a guest is likely expecting.'),
  ('washer', 'laundry', 'nice_to_have', 4, 'For laundry management, all units include a washer and dryer, and the cleaning crew start laundry when they arrive to clean the unit.'),
  ('parking', 'parking', 'nice_to_have', 3, 'Include specific amenity details in your description such as ''indoor fireplace,'' ''75 mbps wifi,'' ''indoor hot tub,'' ''onsite garage parking for 2 vehicles,'' and ''24/7 security.'''),
  ('desk', 'dedicated_workspace', 'nice_to_have', 2, 'Setting up a work-from-home desk and a comfy office chair can increase bookings.'),
  ('hot', 'hot_tub', 'premium', 1, 'Adding a jacuzzi or hot tub can increase occupancy by up to 15%.'),
  ('patio', 'outdoor_space', 'nice_to_have', 1, 'Having multiple outdoor spaces, such as balconies and patios, enhances the appeal of a cabin rental by offering guests various areas to enjoy the natural surroundings.'),
  ('self', 'self_check_in', 'nice_to_have', 0, ''),
  ('ev', 'ev_charger', 'premium', 0, ''),
  ('grill', 'bbq_grill', 'nice_to_have', 0, ''),
  ('crib', 'family_friendly', 'nice_to_have', 0, '')
ON CONFLICT (normalized_name) DO UPDATE SET
  tier = EXCLUDED.tier,
  mention_count = EXCLUDED.mention_count,
  sample_insight = EXCLUDED.sample_insight;

-- ============================================
-- 3. Mistake Rules Table
-- ============================================

CREATE TABLE IF NOT EXISTS listings.mistake_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_attribute text NOT NULL,
  condition_hint text,
  mistake_text text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  source_category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed with extracted mistake rules
INSERT INTO listings.mistake_rules (trigger_attribute, condition_hint, mistake_text, severity, source_category)
VALUES
  ('amenities', '', 'A costly mistake when designing is just throwing amenities around without any clear strategy. Instead, consider how design choices will impact revenue and guest experience.', 'info', 'Your Listing'),
  ('overall_rating', '', 'Many hosts start renovating too early; renovations don''t always add value to cash flow.', 'warning', 'Your Listing'),
  ('amenities', '', 'Not filling out all filters on your listings so guests looking for particular features will not see your properties.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Don''t use photos with logos or text on them due to channel restrictions.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Avoid uploading photos smaller than 600x400 pixels, though 1920x1080 is recommended for clarity.', 'warning', 'Your Listing'),
  ('overall_rating', '', 'Avoid over-decorating for Christmas, as it can be overwhelming for guests.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Don''t prioritize aesthetics in photos over the actual guest experience, as guests will be disappointed if the property looks great but is otherwise lacking.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Photos of amenities without people look stale, making it more difficult for potential guests to imagine themselves in the space.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t overstate the quality or accessibility of nearby amenities; ensure accuracy to avoid disappointing guests.', 'warning', 'Your Listing'),
  ('nightly_price', '', 'Don''t assume pricing is the only issue impacting bookings; weak listing content may be the culprit.', 'warning', 'Your Listing'),
  ('nightly_price', '', 'Don''t overlook the impact of listing presentation on nightly rates; invest in good lighting, decor, and outdoor setups.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t miss opportunities to highlight unique or memorable features in your area to attract more guests to your listing.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t rely solely on a property''s unique features; instead, invest in both renovations and the guest experience to maximize bookings and revenue.', 'warning', 'Your Listing'),
  ('amenities', '', 'Container homes are difficult to work with, so the addition of windows is a notable feature.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t use boring standard sliding doors; instead, use a live-edge wood slab door to create a unique feature in the bathroom.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t assume that showcasing just your primary accommodation is sufficient; highlight additional experiences or amenities offered on your property to fully capture guest interest.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t design or add features to your property without considering how they would appeal to your target audience.', 'info', 'Your Listing'),
  ('photo_count', '', 'Be sure to highlight and photograph any notable architectural awards that your space has earned.', 'warning', 'Your Listing'),
  ('amenities', '', 'Just setting up your tent and putting it on Airbnb doesn''t make it worth it, you need to furnish and offer certain amenities that you typically wouldn''t get out in the wild.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t neglect the outdoor amenities - an outdoor shower, fire pit, and nature trails all add to the guest experience.', 'warning', 'Your Listing'),
  ('amenities', '', 'Don''t overlook outdoor amenities. They can greatly add to the overall guest experience, making the tiny home more appealing.', 'warning', 'Your Listing'),
  ('amenities', '', 'Ensure easy access to all the advertised features of the property, such as the hiking trail, to allow easy guest exploration of these features.', 'warning', 'Your Listing'),
  ('overall_rating', '', 'You have to consider that a tenant might start smoking on your property. If that occurs they will cause damage. This is because items wear out over time and burn marks cannot be fixed.', 'info', 'Your Listing'),
  ('photo_count', '', 'Failing to capture the entire property with good pictures can detract guests from the property.  Additionally, forgetting a key detail in photographs can also detract from the property.', 'warning', 'Your Listing'),
  ('review_count', '', 'Don''t slouch on bed and pillow quality as this may be reflected in a negative review.', 'warning', 'Your Listing'),
  ('amenities', '', 'Avoid neglecting amenities like outdoor spaces and fire pits, especially for group bookings. The Sunday House excels in communal areas.', 'warning', 'Your Listing'),
  ('amenities', '', 'Avoid generic designs; aim for unique features that set your listing apart.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Failing to have professional photos of your listing can cause you to lose out on potential profits.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Ensure the listing photos accurately portray the cabin size; the host found it to be much larger than expected.', 'warning', 'Your Listing'),
  ('photo_count', '', 'Leaving photos of ongoing construction/renovation work. Make sure listing is up to date.', 'warning', 'Your Listing');

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_amenity_importance_tier ON listings.amenity_importance(tier);
CREATE INDEX IF NOT EXISTS idx_mistake_rules_attribute ON listings.mistake_rules(trigger_attribute);
CREATE INDEX IF NOT EXISTS idx_mistake_rules_active ON listings.mistake_rules(is_active) WHERE is_active = true;
