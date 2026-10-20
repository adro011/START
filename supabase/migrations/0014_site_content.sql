-- brand-store 0014: Site content editing system (sections, theme tokens, versions)

-- 1. site_sections: each main UI portion is a row (key = stable id, sort = order)
CREATE TABLE public.site_sections (
  key text PRIMARY KEY,
  label text NOT NULL,                   -- human label for admin UI
  kind text NOT NULL,                    -- "hero" | "panels" | "statement" | "grid" | "split" | "carousel" | "trust" | "instagram" | "newsletter" | "custom"
  sort integer NOT NULL DEFAULT 0,       -- display order
  enabled boolean NOT NULL DEFAULT true, -- soft toggle
  content jsonb NOT NULL DEFAULT '{}',   -- section-specific content (validated by zod per kind)
  styles jsonb NOT NULL DEFAULT '{}',    -- section-scoped style overrides (whitelisted CSS vars)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. theme_tokens: design tokens editable in admin (whitelisted keys only)
CREATE TABLE public.theme_tokens (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. content_versions: immutable audit trail of content changes
CREATE TABLE public.content_versions (
  id bigserial PRIMARY KEY,
  section_key text NOT NULL REFERENCES public.site_sections(key) ON DELETE CASCADE,
  content jsonb NOT NULL,
  styles jsonb NOT NULL,
  editor text,                           -- admin email/identifier
  message text,                          -- commit message
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast history lookups
CREATE INDEX idx_content_versions_section ON public.content_versions(section_key, created_at DESC);

-- updated_at trigger (reuses existing pattern)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_sections_updated ON public.site_sections;
CREATE TRIGGER trg_site_sections_updated
  BEFORE UPDATE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_theme_tokens_updated ON public.theme_tokens;
CREATE TRIGGER trg_theme_tokens_updated
  BEFORE UPDATE ON public.theme_tokens
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Public read (storefront needs these on every page load)
DROP POLICY IF EXISTS "sections public read" ON public.site_sections;
CREATE POLICY "sections public read" ON public.site_sections
  FOR SELECT TO public USING (enabled = true);

DROP POLICY IF EXISTS "tokens public read" ON public.theme_tokens;
CREATE POLICY "tokens public read" ON public.theme_tokens
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "versions public read" ON public.content_versions;
CREATE POLICY "versions public read" ON public.content_versions
  FOR SELECT TO public USING (true);

-- Admin write (uses existing is_admin() helper from 0002)
DROP POLICY IF EXISTS "sections admin all" ON public.site_sections;
CREATE POLICY "sections admin all" ON public.site_sections
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "tokens admin all" ON public.theme_tokens;
CREATE POLICY "tokens admin all" ON public.theme_tokens
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "versions admin all" ON public.content_versions;
CREATE POLICY "versions admin all" ON public.content_versions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed current home page sections (order matches page.tsx as of 0014)
INSERT INTO public.site_sections (key, label, kind, sort, enabled, content, styles) VALUES
-- 1. Cover / hero entrance
(
  'cover',
  'Cover Entrance',
  'hero',
  10,
  true,
  '{
    "headline": "HABIBI",
    "subheadline": "COME TO HABIBI",
    "cta": { "label": "SHOP NOW", "href": "/shop" },
    "background": "/hero/hero-cover.svg"
  }'::jsonb,
  '{}'::jsonb
),
-- 2. Women/Men/Kids hero panels (the animated spring panels)
(
  'panels',
  'Hero Panels (Women / Men / Kids)',
  'panels',
  20,
  true,
  '{
    "panels": [
      { "index": 0, "title": "WOMEN", "slug": "women", "image": "/hero/women.svg", "color": "#FFC000" },
      { "index": 1, "title": "MEN", "slug": "men", "image": "/hero/men.svg", "color": "#29ABE2" },
      { "index": 2, "title": "KIDS", "slug": "kids", "image": "/hero/kids.svg", "color": "#1EAEDB" }
    ]
  }'::jsonb,
  '{}'::jsonb
),
-- 3. Brand statement / philosophy
(
  'statement',
  'Brand Statement',
  'statement',
  30,
  true,
  '{
    "title": "CRAFTED FOR THE FEW WHO DARE",
    "body": "Every piece begins in the atelier — hand-cut, hand-stitched, finished with obsession. No compromise. No shortcuts. Just the quiet confidence of knowing you wear the exceptional.",
    "cta": { "label": "OUR STORY", "href": "/about" }
  }'::jsonb,
  '{}'::jsonb
),
-- 4. New arrivals product grid
(
  'new-arrivals',
  'New Arrivals',
  'grid',
  40,
  true,
  '{
    "title": "NEW ARRIVALS",
    "subtitle": "Fresh drops, limited quantities",
    "section": "women",
    "limit": 8,
    "showViewAll": true,
    "viewAllHref": "/shop?section=women&sort=newest"
  }'::jsonb,
  '{}'::jsonb
),
-- 5. Category showcase (Men / Women / Kids tiles)
(
  'category',
  'Category Showcase',
  'split',
  50,
  true,
  '{
    "title": "SHOP BY CATEGORY",
    "items": [
      { "title": "MEN", "slug": "men", "image": "/hero/men.svg", "description": "Tailored essentials & modern classics" },
      { "title": "WOMEN", "slug": "women", "image": "/hero/women.svg", "description": "Effortless elegance, redefined" },
      { "title": "KIDS", "slug": "kids", "image": "/hero/kids.svg", "description": "Mini styles, major attitude" }
    ]
  }'::jsonb,
  '{}'::jsonb
),
-- 6. Occasions
(
  'occasion',
  'Occasions',
  'grid',
  60,
  true,
  '{
    "title": "SHOP BY OCCASION",
    "items": [
      { "title": "WEDDING", "slug": "wedding", "image": "/occasions/wedding.svg" },
      { "title": "PARTY", "slug": "party", "image": "/occasions/party.svg" },
      { "title": "CASUAL", "slug": "casual", "image": "/occasions/casual.svg" },
      { "title": "FORMAL", "slug": "formal", "image": "/occasions/formal.svg" }
    ]
  }'::jsonb,
  '{}'::jsonb
),
-- 7. Sale / featured promotions
(
  'sale',
  'Sale Promotion',
  'split',
  70,
  true,
  '{
    "title": "SEASONAL SALE",
    "subtitle": "Up to 50% off selected styles",
    "cta": { "label": "SHOP SALE", "href": "/sale" },
    "image": "/hero/sale-banner.svg",
    "badge": "LIMITED TIME"
  }'::jsonb,
  '{}'::jsonb
),
-- 8. Craft / heritage story
(
  'craft',
  'Craft Heritage',
  'statement',
  80,
  true,
  '{
    "title": "THE ART OF MAKING",
    "body": "From the first sketch to the final press, every garment passes through 47 pairs of hands. This is not manufacturing. This is heritage in motion.",
    "image": "/craft/atelier.svg"
  }'::jsonb,
  '{}'::jsonb
),
-- 9. Testimonials carousel
(
  'testimonials',
  'Testimonials',
  'carousel',
  90,
  true,
  '{
    "title": "WHAT OUR CLIENTS SAY",
    "items": [
      { "quote": "The fit is impeccable. I have never worn anything that feels this precise.", "author": "A. Rahman", "role": "Founder, A.R. Collective" },
      { "quote": "Habibi understands the modern gentleman. Sharp, comfortable, timeless.", "author": "S. Khan", "role": "Creative Director" },
      { "quote": "My go-to for every occasion. The quality speaks for itself.", "author": "M. Hassan", "role": "Architect" }
    ]
  }'::jsonb,
  '{}'::jsonb
),
-- 10. Trust badges
(
  'trust',
  'Trust Badges',
  'trust',
  100,
  true,
  '{
    "items": [
      { "icon": "shield", "title": "AUTHENTICITY GUARANTEED", "description": "Every piece verified" },
      { "icon": "truck", "title": "FREE SHIPPING", "description": "On orders over ৳5000" },
      { "icon": "rotate-ccw", "title": "EASY RETURNS", "description": "30 days, no questions" },
      { "icon": "lock", "title": "SECURE PAYMENT", "description": "SSL encrypted checkout" }
    ]
  }'::jsonb,
  '{}'::jsonb
),
-- 11. Instagram feed
(
  'instagram',
  'Instagram Feed',
  'instagram',
  110,
  true,
  '{
    "title": "HABIBI IN THE WILD",
    "handle": "@habibi",
    "limit": 6
  }'::jsonb,
  '{}'::jsonb
),
-- 12. Newsletter signup
(
  'newsletter',
  'Newsletter Signup',
  'newsletter',
  120,
  true,
  '{
    "title": "JOIN THE INNER CIRCLE",
    "subtitle": "Early access, exclusive drops, and the stories behind the stitches.",
    "placeholder": "your@email.com",
    "button": "SUBSCRIBE",
    "privacyNote": "We respect your inbox. Unsubscribe anytime."
  }'::jsonb,
  '{}'::jsonb
);

-- Seed theme tokens (whitelisted keys that buildThemeCss will expose as CSS vars)
-- These mirror the design-system tokens but allow runtime overrides.
INSERT INTO public.theme_tokens (key, value, description) VALUES
-- Colors
('color-primary-gold', '#FFC000', 'Primary brand gold'),
('color-primary-gold-hover', '#917300', 'Gold hover state'),
('color-primary-gold-text', '#FFCE3E', 'Gold for text on dark'),
('color-accent-cyan', '#29ABE2', 'Cyan accent'),
('color-accent-link-blue', '#3860BE', 'Link blue'),
('color-accent-teal-action', '#1EAEDB', 'Teal action'),
('color-semantic-success', '#1EAEDB', 'Success'),
('color-semantic-error', '#FF3B30', 'Error'),
('color-semantic-warning', '#FF9500', 'Warning'),
('color-semantic-info', '#29ABE2', 'Info'),
-- Surfaces
('color-surface-level0', '#000000', 'Absolute black'),
('color-surface-level1', '#181818', 'Dark iron'),
('color-surface-level2', '#202020', 'Charcoal'),
('color-surface-level3', 'rgba(0,0,0,0.7)', 'Overlay dark'),
('color-surface-level4', 'rgba(0,0,0,0.5)', 'Overlay medium'),
('color-surface-level5', 'rgba(0,0,0,0.25)', 'Overlay light'),
-- Borders
('color-border-primary', 'rgba(255,255,255,0.5)', 'Primary border'),
('color-border-secondary', '#202020', 'Secondary border'),
('color-border-focus', '#000000', 'Focus ring'),
-- Typography
('font-family-display', '"LamboType", "Roboto", "Helvetica Neue", Arial, sans-serif', 'Display font stack'),
('font-family-ui', '"LamboType", "Open Sans", ui-sans-serif, system-ui, sans-serif', 'UI font stack'),
('font-family-mono', 'SF Mono, Monaco, "Courier New", monospace', 'Monospace font stack'),
-- Font sizes (clamp values)
('font-size-hero', 'clamp(54px, 12vw, 120px)', 'Hero headline'),
('font-size-display2', 'clamp(40px, 8vw, 80px)', 'Display 2'),
('font-size-display3', 'clamp(32px, 6vw, 54px)', 'Display 3'),
('font-size-display4', 'clamp(28px, 5vw, 40px)', 'Display 4'),
('font-size-feature', 'clamp(20px, 3vw, 27px)', 'Feature text'),
('font-size-card-title', 'clamp(18px, 2.5vw, 24px)', 'Card title'),
('font-size-body-large', 'clamp(16px, 2vw, 18px)', 'Body large'),
('font-size-body', 'clamp(14px, 1.5vw, 16px)', 'Body'),
('font-size-body-small', 'clamp(12px, 1vw, 14px)', 'Body small'),
('font-size-caption', 'clamp(11px, 1vw, 14px)', 'Caption'),
-- Spacing
('space-4', '8px', 'Space 4'),
('space-6', '12px', 'Space 6'),
('space-8', '16px', 'Space 8'),
('space-10', '24px', 'Space 10'),
('space-12', '40px', 'Space 12'),
('space-14', '56px', 'Space 14'),
-- Durations
('duration-fast', '150ms', 'Fast transition'),
('duration-standard', '250ms', 'Standard transition'),
('duration-slow', '350ms', 'Slow transition'),
('duration-hero', '1200ms', 'Hero entrance'),
-- Easing
('easing-lamborghini', 'cubic-bezier(0.22, 1, 0.36, 1)', 'Brand easing'),
('easing-spring', 'cubic-bezier(0.34, 1.56, 0.64, 1)', 'Spring easing'),
-- Stagger
('stagger-tight', '0.04s', 'Tight stagger'),
('stagger-standard', '0.08s', 'Standard stagger'),
('stagger-section', '0.16s', 'Section stagger');