/**
 * ABRAR Exclusive — Particle Registry & Semantic Manifest
 *
 * Every UI particle across the storefront (headings, paragraphs, spans, badges,
 * buttons, links, images, inputs, cards, sections, prices, icons, and spotlight
 * configurations) is cataloged with a deterministic dot-separated ID, human-readable
 * label, CSS/attribute selector, default value, and natural-language keywords.
 */

export type ParticleType =
  | "text"
  | "heading"
  | "badge"
  | "button"
  | "link"
  | "image"
  | "input"
  | "card"
  | "section"
  | "icon"
  | "price"
  | "config";

export interface ParticleDefinition {
  id: string;
  label: string;
  type: ParticleType;
  defaultValue: string;
  selector: string;
  keywords: string[];
  section?: string;
}

export const PARTICLE_MANIFEST: Record<string, ParticleDefinition> = {
  // ── Header & Global Navigation ──────────────────────────────────────────────
  "header.announcement.bar": {
    id: "header.announcement.bar",
    label: "Top announcement banner text",
    type: "badge",
    defaultValue: "Promising Quality · Delivery throughout Bangladesh",
    selector: "[data-particle-id='header.announcement.bar'], header [role='region']",
    keywords: ["announcement", "top bar", "banner", "marquee", "header strip", "free shipping bar"],
    section: "header",
  },
  "header.brand.logo": {
    id: "header.brand.logo",
    label: "Header brand wordmark logo (ABRAR)",
    type: "link",
    defaultValue: "ABRAR",
    selector: "[data-particle-id='header.brand.logo'], header a[href='/']",
    keywords: ["logo", "brand name", "header logo", "wordmark", "abrar logo"],
    section: "header",
  },
  "header.nav.men": {
    id: "header.nav.men",
    label: "Header navigation link — Men",
    type: "link",
    defaultValue: "Men",
    selector: "[data-particle-id='header.nav.men'], header nav a[href='/men']",
    keywords: ["men nav", "header men", "menu men", "navigation men"],
    section: "header",
  },
  "header.nav.women": {
    id: "header.nav.women",
    label: "Header navigation link — Women",
    type: "link",
    defaultValue: "Women",
    selector: "[data-particle-id='header.nav.women'], header nav a[href='/women']",
    keywords: ["women nav", "header women", "menu women", "navigation women"],
    section: "header",
  },
  "header.nav.kids": {
    id: "header.nav.kids",
    label: "Header navigation link — Kids",
    type: "link",
    defaultValue: "Kids",
    selector: "[data-particle-id='header.nav.kids'], header nav a[href='/kids']",
    keywords: ["kids nav", "header kids", "children menu", "navigation kids"],
    section: "header",
  },
  "header.nav.new-arrivals": {
    id: "header.nav.new-arrivals",
    label: "Header navigation link — New Arrivals",
    type: "link",
    defaultValue: "New Arrivals",
    selector: "[data-particle-id='header.nav.new-arrivals'], header nav a[href='/new-arrivals']",
    keywords: ["new arrivals nav", "header new arrivals", "just landed menu"],
    section: "header",
  },
  "header.nav.sale": {
    id: "header.nav.sale",
    label: "Header navigation link — Sale",
    type: "link",
    defaultValue: "Sale",
    selector: "[data-particle-id='header.nav.sale'], header nav a[href='/sale']",
    keywords: ["sale nav", "header sale", "discount menu", "offers link"],
    section: "header",
  },
  "header.nav.stories": {
    id: "header.nav.stories",
    label: "Header navigation link — Stories",
    type: "link",
    defaultValue: "Stories",
    selector: "[data-particle-id='header.nav.stories'], header nav a[href='/stories']",
    keywords: ["stories nav", "header stories", "editorial menu", "journal link"],
    section: "header",
  },
  "header.actions.search": {
    id: "header.actions.search",
    label: "Header search trigger button",
    type: "button",
    defaultValue: "Search",
    selector: "[data-particle-id='header.actions.search'], header button[aria-label*='Search' i]",
    keywords: ["search button", "header search", "find button", "magnifying glass"],
    section: "header",
  },
  "header.actions.locale": {
    id: "header.actions.locale",
    label: "Header language switcher (EN / বাং)",
    type: "button",
    defaultValue: "EN",
    selector: "[data-particle-id='header.actions.locale']",
    keywords: ["language button", "locale toggle", "english bangla", "translation button"],
    section: "header",
  },
  "header.actions.cart": {
    id: "header.actions.cart",
    label: "Header shopping bag / cart button",
    type: "button",
    defaultValue: "Bag",
    selector: "[data-particle-id='header.actions.cart'], header button[aria-label*='bag' i], header button[aria-label*='cart' i]",
    keywords: ["cart button", "shopping bag", "header bag", "basket button"],
    section: "header",
  },

  // ── Home: Cover Section (N°01 — The Cover) ──────────────────────────────────
  "home.cover.section": {
    id: "home.cover.section",
    label: "Home full-viewport cover section",
    type: "section",
    defaultValue: "New collection cover",
    selector: "[data-particle-id='home.cover.section'], section.cover",
    keywords: ["cover section", "top hero", "first section", "lamborghini cover"],
    section: "home.cover",
  },
  "home.cover.image": {
    id: "home.cover.image",
    label: "Home cover portrait background image",
    type: "image",
    defaultValue: "/hero/women.jpg",
    selector: "[data-particle-id='home.cover.image'], section.cover .cover-media img",
    keywords: ["cover image", "hero background photo", "main banner image", "top portrait"],
    section: "home.cover",
  },
  "home.cover.eyebrow": {
    id: "home.cover.eyebrow",
    label: "Home cover eyebrow kicker text",
    type: "badge",
    defaultValue: "New Collection — Eid '26 Edit",
    selector: "[data-particle-id='home.cover.eyebrow'], .cover-eyebrow",
    keywords: ["cover eyebrow", "eid 26 edit", "new collection badge", "top kicker", "hero subtitle above title"],
    section: "home.cover",
  },
  "home.cover.title": {
    id: "home.cover.title",
    label: "Home cover giant wordmark heading",
    type: "heading",
    defaultValue: "ABRAR",
    selector: "[data-particle-id='home.cover.title'], .cover-title, section.cover h1",
    keywords: ["cover title", "main heading", "giant wordmark", "hero title", "abrar big text", "h1"],
    section: "home.cover",
  },
  "home.cover.tagline": {
    id: "home.cover.tagline",
    label: "Home cover brand tagline",
    type: "text",
    defaultValue: "Connecting Consumer through Digital media",
    selector: "[data-particle-id='home.cover.tagline']",
    keywords: ["cover tagline", "brand slogan", "connecting consumer", "digital media text", "hero description"],
    section: "home.cover",
  },
  "home.cover.cta.primary": {
    id: "home.cover.cta.primary",
    label: "Home cover primary CTA button (Shop new arrivals)",
    type: "button",
    defaultValue: "Shop new arrivals →",
    selector: "[data-particle-id='home.cover.cta.primary'], section.cover a[href='/new-arrivals']",
    keywords: ["cover primary button", "shop new arrivals button", "first hero button", "main cta"],
    section: "home.cover",
  },
  "home.cover.cta.secondary": {
    id: "home.cover.cta.secondary",
    label: "Home cover secondary CTA button (Explore women)",
    type: "button",
    defaultValue: "Explore women →",
    selector: "[data-particle-id='home.cover.cta.secondary'], section.cover a[href='/women']",
    keywords: ["cover secondary button", "explore women button", "second hero button"],
    section: "home.cover",
  },
  "home.cover.location": {
    id: "home.cover.location",
    label: "Home cover bottom-left location stamp",
    type: "text",
    defaultValue: "Dhaka — Worldwide",
    selector: "[data-particle-id='home.cover.location']",
    keywords: ["dhaka worldwide", "cover location", "bottom left stamp"],
    section: "home.cover",
  },
  "home.cover.index": {
    id: "home.cover.index",
    label: "Home cover bottom-right edition number",
    type: "badge",
    defaultValue: "N°01 — The Cover",
    selector: "[data-particle-id='home.cover.index']",
    keywords: ["the cover badge", "n01", "bottom right cover text"],
    section: "home.cover",
  },

  // ── Home: Hero Panels Section (01 MAN, 02 WOMEN, 03 CHILDREN) ───────────────
  "home.hero.section": {
    id: "home.hero.section",
    label: "Home interactive triptych hero panels section",
    type: "section",
    defaultValue: "Shop by section",
    selector: "[data-particle-id='home.hero.section'], section[aria-label='Shop by section']",
    keywords: ["hero panels section", "three columns hero", "man women children section"],
    section: "home.hero",
  },
  "home.hero.eyebrow.left": {
    id: "home.hero.eyebrow.left",
    label: "Hero panels top-left eyebrow",
    type: "text",
    defaultValue: "Connecting Consumer through Digital media",
    selector: "[data-particle-id='home.hero.eyebrow.left']",
    keywords: ["hero left eyebrow", "panels top left text"],
    section: "home.hero",
  },
  "home.hero.eyebrow.right": {
    id: "home.hero.eyebrow.right",
    label: "Hero panels top-right edition stamp",
    type: "text",
    defaultValue: "Est. Dhaka · Eid '26 edit live",
    selector: "[data-particle-id='home.hero.eyebrow.right']",
    keywords: ["est dhaka", "hero right eyebrow", "eid 26 edit live"],
    section: "home.hero",
  },
  "home.hero.panel.01": {
    id: "home.hero.panel.01",
    label: "Hero Panel 01 — MAN card",
    type: "card",
    defaultValue: "MAN",
    selector: "[data-particle-id='home.hero.panel.01']",
    keywords: ["panel 01", "man panel", "men hero card", "first panel"],
    section: "home.hero",
  },
  "home.hero.panel.01.title": {
    id: "home.hero.panel.01.title",
    label: "Hero Panel 01 title (MAN)",
    type: "heading",
    defaultValue: "MAN",
    selector: "[data-particle-id='home.hero.panel.01.title']",
    keywords: ["man panel title", "01 man heading"],
    section: "home.hero",
  },
  "home.hero.panel.01.image": {
    id: "home.hero.panel.01.image",
    label: "Hero Panel 01 portrait image (MAN)",
    type: "image",
    defaultValue: "/hero/men.jpg",
    selector: "[data-particle-id='home.hero.panel.01.image']",
    keywords: ["man panel image", "men hero photo", "panel 01 picture"],
    section: "home.hero",
  },
  "home.hero.panel.02": {
    id: "home.hero.panel.02",
    label: "Hero Panel 02 — WOMEN card",
    type: "card",
    defaultValue: "WOMEN",
    selector: "[data-particle-id='home.hero.panel.02']",
    keywords: ["panel 02", "women panel", "women hero card", "middle panel"],
    section: "home.hero",
  },
  "home.hero.panel.02.title": {
    id: "home.hero.panel.02.title",
    label: "Hero Panel 02 title (WOMEN)",
    type: "heading",
    defaultValue: "WOMEN",
    selector: "[data-particle-id='home.hero.panel.02.title']",
    keywords: ["women panel title", "02 women heading"],
    section: "home.hero",
  },
  "home.hero.panel.02.image": {
    id: "home.hero.panel.02.image",
    label: "Hero Panel 02 portrait image (WOMEN)",
    type: "image",
    defaultValue: "/hero/women.jpg",
    selector: "[data-particle-id='home.hero.panel.02.image']",
    keywords: ["women panel image", "women hero photo", "panel 02 picture"],
    section: "home.hero",
  },
  "home.hero.panel.03": {
    id: "home.hero.panel.03",
    label: "Hero Panel 03 — CHILDREN card",
    type: "card",
    defaultValue: "CHILDREN",
    selector: "[data-particle-id='home.hero.panel.03']",
    keywords: ["panel 03", "children panel", "kids hero card", "third panel"],
    section: "home.hero",
  },
  "home.hero.panel.03.title": {
    id: "home.hero.panel.03.title",
    label: "Hero Panel 03 title (CHILDREN)",
    type: "heading",
    defaultValue: "CHILDREN",
    selector: "[data-particle-id='home.hero.panel.03.title']",
    keywords: ["children panel title", "03 children heading", "kids panel title"],
    section: "home.hero",
  },
  "home.hero.panel.03.image": {
    id: "home.hero.panel.03.image",
    label: "Hero Panel 03 portrait image (CHILDREN)",
    type: "image",
    defaultValue: "/hero/kids.jpg",
    selector: "[data-particle-id='home.hero.panel.03.image']",
    keywords: ["children panel image", "kids hero photo", "panel 03 picture"],
    section: "home.hero",
  },
  "home.hero.marquee": {
    id: "home.hero.marquee",
    label: "Home scrolling luxury ticker marquee strip",
    type: "text",
    defaultValue: "Promising Quality ✦ Delivery throughout Bangladesh ✦ Beauty, Elegance and Simplicity",
    selector: "[data-particle-id='home.hero.marquee'], .marquee-lux",
    keywords: ["marquee", "scrolling text", "ticker strip", "promising quality"],
    section: "home.hero",
  },

  // ── Home: Brand Statement ───────────────────────────────────────────────────
  "home.statement.section": {
    id: "home.statement.section",
    label: "House of Abrar brand statement section",
    type: "section",
    defaultValue: "House statement",
    selector: "[data-particle-id='home.statement.section'], section[aria-label='House statement']",
    keywords: ["statement section", "house of abrar section", "brand manifesto"],
    section: "home.statement",
  },
  "home.statement.kicker": {
    id: "home.statement.kicker",
    label: "Brand statement eyebrow kicker",
    type: "badge",
    defaultValue: "The house of Abrar",
    selector: "[data-particle-id='home.statement.kicker'], section[aria-label='House statement'] .kicker",
    keywords: ["statement kicker", "the house of abrar", "manifesto eyebrow"],
    section: "home.statement",
  },
  "home.statement.headline": {
    id: "home.statement.headline",
    label: "Brand statement editorial headline",
    type: "heading",
    defaultValue: "Quiet luxury, cut for real weather and real bodies.",
    selector: "[data-particle-id='home.statement.headline'], section[aria-label='House statement'] .display-xl",
    keywords: ["statement headline", "quiet luxury", "real weather and real bodies", "house quote"],
    section: "home.statement",
  },

  // ── Home: New Arrivals Rail ─────────────────────────────────────────────────
  "home.new-arrivals.section": {
    id: "home.new-arrivals.section",
    label: "Home New Arrivals product rail section",
    type: "section",
    defaultValue: "New arrivals",
    selector: "[data-particle-id='home.new-arrivals.section'], section[aria-label='New arrivals']",
    keywords: ["new arrivals section", "just landed rail", "latest products section"],
    section: "home.new-arrivals",
  },
  "home.new-arrivals.kicker": {
    id: "home.new-arrivals.kicker",
    label: "New Arrivals section kicker",
    type: "badge",
    defaultValue: "Just landed — small batches",
    selector: "[data-particle-id='home.new-arrivals.kicker'], section[aria-label='New arrivals'] .kicker",
    keywords: ["just landed", "small batches", "new arrivals kicker"],
    section: "home.new-arrivals",
  },
  "home.new-arrivals.title": {
    id: "home.new-arrivals.title",
    label: "New Arrivals section heading",
    type: "heading",
    defaultValue: "New arrivals",
    selector: "[data-particle-id='home.new-arrivals.title'], section[aria-label='New arrivals'] h2",
    keywords: ["new arrivals title", "new arrivals heading"],
    section: "home.new-arrivals",
  },
  "home.new-arrivals.copy": {
    id: "home.new-arrivals.copy",
    label: "New Arrivals section description copy",
    type: "text",
    defaultValue: "Honest fabrics, limited runs. When it's gone, it's gone.",
    selector: "[data-particle-id='home.new-arrivals.copy']",
    keywords: ["honest fabrics", "limited runs", "new arrivals description", "new arrivals subtitle"],
    section: "home.new-arrivals",
  },
  "home.new-arrivals.cta": {
    id: "home.new-arrivals.cta",
    label: "New Arrivals 'View all' button",
    type: "button",
    defaultValue: "View all →",
    selector: "[data-particle-id='home.new-arrivals.cta'], section[aria-label='New arrivals'] a[href='/new-arrivals']",
    keywords: ["new arrivals view all", "new arrivals button"],
    section: "home.new-arrivals",
  },

  // ── Home: Shop by Category ──────────────────────────────────────────────────
  "home.category.section": {
    id: "home.category.section",
    label: "Home Shop by Category grid section",
    type: "section",
    defaultValue: "Shop by category",
    selector: "[data-particle-id='home.category.section'], section[aria-label='Shop by category']",
    keywords: ["category section", "shop by category", "six tiles grid"],
    section: "home.category",
  },
  "home.category.kicker": {
    id: "home.category.kicker",
    label: "Shop by Category kicker",
    type: "badge",
    defaultValue: "Find your lane",
    selector: "[data-particle-id='home.category.kicker'], section[aria-label='Shop by category'] .kicker",
    keywords: ["find your lane", "category kicker"],
    section: "home.category",
  },
  "home.category.title": {
    id: "home.category.title",
    label: "Shop by Category heading",
    type: "heading",
    defaultValue: "Shop by category",
    selector: "[data-particle-id='home.category.title'], section[aria-label='Shop by category'] h2",
    keywords: ["shop by category title", "category heading", "categories title"],
    section: "home.category",
  },
  "home.category.copy": {
    id: "home.category.copy",
    label: "Shop by Category subtitle copy",
    type: "text",
    defaultValue: "Three sections, one thread: clothes that respect the craft.",
    selector: "[data-particle-id='home.category.copy']",
    keywords: ["three sections one thread", "category description", "category copy"],
    section: "home.category",
  },

  // ── Home: Shop by Occasion ──────────────────────────────────────────────────
  "home.occasion.section": {
    id: "home.occasion.section",
    label: "Home Shop by Occasion section",
    type: "section",
    defaultValue: "Shop by occasion",
    selector: "[data-particle-id='home.occasion.section'], section[aria-label='Shop by occasion']",
    keywords: ["occasion section", "shop by occasion", "eid wedding everyday winter"],
    section: "home.occasion",
  },
  "home.occasion.kicker": {
    id: "home.occasion.kicker",
    label: "Shop by Occasion kicker",
    type: "badge",
    defaultValue: "Dress for the day",
    selector: "[data-particle-id='home.occasion.kicker'], section[aria-label='Shop by occasion'] .kicker",
    keywords: ["dress for the day", "occasion kicker"],
    section: "home.occasion",
  },
  "home.occasion.title": {
    id: "home.occasion.title",
    label: "Shop by Occasion heading",
    type: "heading",
    defaultValue: "Shop by occasion",
    selector: "[data-particle-id='home.occasion.title'], section[aria-label='Shop by occasion'] h2",
    keywords: ["shop by occasion title", "occasion heading", "occasions title"],
    section: "home.occasion",
  },
  "home.occasion.copy": {
    id: "home.occasion.copy",
    label: "Shop by Occasion description",
    type: "text",
    defaultValue: "Eid mornings, wedding evenings, and everything in between.",
    selector: "[data-particle-id='home.occasion.copy']",
    keywords: ["eid mornings wedding evenings", "occasion description"],
    section: "home.occasion",
  },

  // ── Home: Sale Cinema ───────────────────────────────────────────────────────
  "home.sale.section": {
    id: "home.sale.section",
    label: "Home Sale Edit section",
    type: "section",
    defaultValue: "Sale",
    selector: "[data-particle-id='home.sale.section'], section[aria-label='Sale']",
    keywords: ["sale section", "the sale edit", "markdowns section"],
    section: "home.sale",
  },
  "home.sale.kicker": {
    id: "home.sale.kicker",
    label: "Sale section kicker",
    type: "badge",
    defaultValue: "Up to honest markdowns",
    selector: "[data-particle-id='home.sale.kicker'], section[aria-label='Sale'] .kicker",
    keywords: ["honest markdowns", "sale kicker"],
    section: "home.sale",
  },
  "home.sale.title": {
    id: "home.sale.title",
    label: "Sale section heading (The sale edit)",
    type: "heading",
    defaultValue: "The sale edit",
    selector: "[data-particle-id='home.sale.title'], section[aria-label='Sale'] h2",
    keywords: ["sale title", "the sale edit", "sale heading"],
    section: "home.sale",
  },
  "home.sale.copy": {
    id: "home.sale.copy",
    label: "Sale section description",
    type: "text",
    defaultValue: "Last pieces, best fabrics. Loved by regulars.",
    selector: "[data-particle-id='home.sale.copy']",
    keywords: ["last pieces best fabrics", "sale copy", "sale subtitle"],
    section: "home.sale",
  },
  "home.sale.cta": {
    id: "home.sale.cta",
    label: "Sale section CTA button (Shop sale)",
    type: "button",
    defaultValue: "Shop sale →",
    selector: "[data-particle-id='home.sale.cta'], section[aria-label='Sale'] a[href='/sale']",
    keywords: ["sale button", "shop sale", "sale cta"],
    section: "home.sale",
  },

  // ── Home: Craft Story ───────────────────────────────────────────────────────
  "home.craft.section": {
    id: "home.craft.section",
    label: "Home Craft Story section",
    type: "section",
    defaultValue: "Our craft",
    selector: "[data-particle-id='home.craft.section'], section[aria-label='Our craft']",
    keywords: ["craft section", "our craft", "loom to doorstep section"],
    section: "home.craft",
  },
  "home.craft.kicker": {
    id: "home.craft.kicker",
    label: "Craft Story kicker",
    type: "badge",
    defaultValue: "Woven, not rushed",
    selector: "[data-particle-id='home.craft.kicker'], section[aria-label='Our craft'] .kicker",
    keywords: ["woven not rushed", "craft kicker"],
    section: "home.craft",
  },
  "home.craft.title": {
    id: "home.craft.title",
    label: "Craft Story heading",
    type: "heading",
    defaultValue: "From loom to doorstep, with patience.",
    selector: "[data-particle-id='home.craft.title'], section[aria-label='Our craft'] h2",
    keywords: ["craft title", "from loom to doorstep", "craft heading"],
    section: "home.craft",
  },
  "home.craft.copy": {
    id: "home.craft.copy",
    label: "Craft Story narrative paragraph",
    type: "text",
    defaultValue:
      "We work with weaving clusters across Bangladesh — muslin, endi, silk — and cut every piece for real bodies and real weather. No overproduction, no shouting discounts. Just clothes that earn their place.",
    selector: "[data-particle-id='home.craft.copy']",
    keywords: ["weaving clusters", "craft paragraph", "craft story text", "muslin endi silk"],
    section: "home.craft",
  },
  "home.craft.cta": {
    id: "home.craft.cta",
    label: "Craft Story CTA button (Read our story)",
    type: "button",
    defaultValue: "Read our story →",
    selector: "[data-particle-id='home.craft.cta'], section[aria-label='Our craft'] a[href='/craft']",
    keywords: ["read our story", "craft button", "craft cta"],
    section: "home.craft",
  },

  // ── Home: Testimonials ──────────────────────────────────────────────────────
  "home.testimonials.section": {
    id: "home.testimonials.section",
    label: "Home Customer Testimonials section",
    type: "section",
    defaultValue: "Customer words",
    selector: "[data-particle-id='home.testimonials.section'], section[aria-label='Customer words']",
    keywords: ["testimonials section", "customer reviews", "word on the street section"],
    section: "home.testimonials",
  },
  "home.testimonials.kicker": {
    id: "home.testimonials.kicker",
    label: "Testimonials section kicker",
    type: "badge",
    defaultValue: "Worn & loved",
    selector: "[data-particle-id='home.testimonials.kicker'], section[aria-label='Customer words'] .kicker",
    keywords: ["worn and loved", "testimonials kicker"],
    section: "home.testimonials",
  },
  "home.testimonials.title": {
    id: "home.testimonials.title",
    label: "Testimonials section heading",
    type: "heading",
    defaultValue: "Word on the street",
    selector: "[data-particle-id='home.testimonials.title'], section[aria-label='Customer words'] h2",
    keywords: ["testimonials title", "word on the street", "reviews heading"],
    section: "home.testimonials",
  },

  // ── Home: Trust Pillars ─────────────────────────────────────────────────────
  "home.trust.section": {
    id: "home.trust.section",
    label: "Home Why Shop With Us trust pillars section",
    type: "section",
    defaultValue: "Why shop with us",
    selector: "[data-particle-id='home.trust.section'], section[aria-label='Why shop with us']",
    keywords: ["trust section", "why shop with us", "cash on delivery section", "guarantees"],
    section: "home.trust",
  },
  "home.trust.title": {
    id: "home.trust.title",
    label: "Trust Pillar 01 heading (Cash on delivery)",
    type: "heading",
    defaultValue: "Cash on delivery",
    selector: "[data-particle-id='home.trust.title'], [data-particle-id='home.trust.01.title']",
    keywords: ["trust title", "cash on delivery", "cod heading", "delivery promise"],
    section: "home.trust",
  },

  // ── Home: Instagram Grid ────────────────────────────────────────────────────
  "home.instagram.section": {
    id: "home.instagram.section",
    label: "Home Instagram community gallery section",
    type: "section",
    defaultValue: "Instagram gallery",
    selector: "[data-particle-id='home.instagram.section'], section[aria-label*='Instagram' i]",
    keywords: ["instagram section", "social gallery", "abrarexclusive.bd grid"],
    section: "home.instagram",
  },
  "home.instagram.title": {
    id: "home.instagram.title",
    label: "Instagram section heading",
    type: "heading",
    defaultValue: "#AbrarInTheWild",
    selector: "[data-particle-id='home.instagram.title'], section[aria-label*='Instagram' i] h2",
    keywords: ["instagram title", "abrar in the wild", "social heading"],
    section: "home.instagram",
  },

  // ── Home: Newsletter CTA ────────────────────────────────────────────────────
  "home.newsletter.section": {
    id: "home.newsletter.section",
    label: "Home Newsletter CTA section",
    type: "section",
    defaultValue: "Newsletter",
    selector: "[data-particle-id='home.newsletter.section'], section[aria-label='Newsletter']",
    keywords: ["newsletter section", "first dibs section", "subscribe section"],
    section: "home.newsletter",
  },
  "home.newsletter.kicker": {
    id: "home.newsletter.kicker",
    label: "Newsletter CTA kicker",
    type: "badge",
    defaultValue: "The letter — 10% off first order",
    selector: "[data-particle-id='home.newsletter.kicker'], section[aria-label='Newsletter'] .kicker",
    keywords: ["the letter", "10% off first order", "newsletter kicker"],
    section: "home.newsletter",
  },
  "home.newsletter.title": {
    id: "home.newsletter.title",
    label: "Newsletter CTA heading (First dibs, every drop.)",
    type: "heading",
    defaultValue: "First dibs, every drop.",
    selector: "[data-particle-id='home.newsletter.title'], section[aria-label='Newsletter'] .display-xl",
    keywords: ["newsletter title", "first dibs every drop", "subscribe heading"],
    section: "home.newsletter",
  },
  "home.newsletter.copy": {
    id: "home.newsletter.copy",
    label: "Newsletter CTA description copy",
    type: "text",
    defaultValue: "Join for 10% off your first order over ৳2,500 — plus craft notes worth opening.",
    selector: "[data-particle-id='home.newsletter.copy']",
    keywords: ["newsletter copy", "craft notes worth opening", "join for 10% off"],
    section: "home.newsletter",
  },
  "home.newsletter.cta": {
    id: "home.newsletter.cta",
    label: "Newsletter CTA button (Subscribe below)",
    type: "button",
    defaultValue: "Subscribe below ↓",
    selector: "[data-particle-id='home.newsletter.cta'], section[aria-label='Newsletter'] a[href='#newsletter']",
    keywords: ["subscribe below button", "newsletter cta", "newsletter button"],
    section: "home.newsletter",
  },

  // ── Footer Particles ────────────────────────────────────────────────────────
  "footer.section": {
    id: "footer.section",
    label: "Site global footer",
    type: "section",
    defaultValue: "Footer",
    selector: "[data-particle-id='footer.section'], footer",
    keywords: ["footer", "bottom section", "site footer"],
    section: "footer",
  },
  "footer.brand.title": {
    id: "footer.brand.title",
    label: "Footer brand wordmark",
    type: "heading",
    defaultValue: "ABRAR",
    selector: "[data-particle-id='footer.brand.title']",
    keywords: ["footer logo", "footer brand name", "bottom abrar"],
    section: "footer",
  },
  "footer.brand.description": {
    id: "footer.brand.description",
    label: "Footer brand manifesto blurb",
    type: "text",
    defaultValue: "A modern Bangladeshi heritage label — panjabis, sharees, kurtas and kids' wear in breathable fabrics.",
    selector: "[data-particle-id='footer.brand.description']",
    keywords: ["footer description", "footer bio", "heritage label blurb"],
    section: "footer",
  },
  "footer.newsletter.input": {
    id: "footer.newsletter.input",
    label: "Footer newsletter email input",
    type: "input",
    defaultValue: "you@domain.com",
    selector: "[data-particle-id='footer.newsletter.input'], footer input[type='email']",
    keywords: ["footer email input", "newsletter input", "subscribe email box"],
    section: "footer",
  },
  "footer.newsletter.button": {
    id: "footer.newsletter.button",
    label: "Footer newsletter submit button",
    type: "button",
    defaultValue: "Join",
    selector: "[data-particle-id='footer.newsletter.button'], footer form button[type='submit']",
    keywords: ["footer subscribe button", "newsletter join button", "email submit"],
    section: "footer",
  },
  "footer.copyright": {
    id: "footer.copyright",
    label: "Footer copyright line",
    type: "text",
    defaultValue: "© ABRAR. All rights reserved.",
    selector: "[data-particle-id='footer.copyright']",
    keywords: ["copyright", "all rights reserved", "footer bottom text"],
    section: "footer",
  },

  // ── Product Card & Detail Particles ─────────────────────────────────────────
  "product.card.title": {
    id: "product.card.title",
    label: "Product card title",
    type: "heading",
    defaultValue: "Artisan Piece",
    selector: "[data-particle-id*='product.card'][data-particle-id$='.title']",
    keywords: ["product card title", "item name", "card heading"],
    section: "product",
  },
  "product.card.price": {
    id: "product.card.price",
    label: "Product card price tag",
    type: "price",
    defaultValue: "৳2,850",
    selector: "[data-particle-id*='product.card'][data-particle-id$='.price'], .price",
    keywords: ["product price", "card price", "taka price", "cost"],
    section: "product",
  },
  "product.detail.title": {
    id: "product.detail.title",
    label: "Product detail page main title",
    type: "heading",
    defaultValue: "Product Title",
    selector: "[data-particle-id='product.detail.title'], main h1",
    keywords: ["product page title", "pdp title", "item heading"],
    section: "product",
  },
  "product.detail.price": {
    id: "product.detail.price",
    label: "Product detail page price",
    type: "price",
    defaultValue: "৳3,200",
    selector: "[data-particle-id='product.detail.price']",
    keywords: ["product page price", "pdp price"],
    section: "product",
  },
  "product.detail.add-to-bag": {
    id: "product.detail.add-to-bag",
    label: "Product detail Add to Bag CTA button",
    type: "button",
    defaultValue: "Add to bag",
    selector: "[data-particle-id='product.detail.add-to-bag']",
    keywords: ["add to bag", "add to cart", "buy button", "purchase button"],
    section: "product",
  },

  // ── Spotlight Engine Configuration Particles ────────────────────────────────
  "spotlight.config.color": {
    id: "spotlight.config.color",
    label: "Spotlight center illumination color (Gold/Yellow)",
    type: "config",
    defaultValue: "#FFD600",
    selector: ":root",
    keywords: ["spotlight color", "yellow spotlight", "gold glow color", "illumination color"],
    section: "spotlight",
  },
  "spotlight.config.bg": {
    id: "spotlight.config.bg",
    label: "Spotlight base pitch-black background color",
    type: "config",
    defaultValue: "#010101",
    selector: ":root",
    keywords: ["spotlight background", "pitch black", "dark background color"],
    section: "spotlight",
  },
  "spotlight.config.intensity": {
    id: "spotlight.config.intensity",
    label: "Spotlight dead-center glow intensity (0.0 to 1.5)",
    type: "config",
    defaultValue: "1.0",
    selector: ":root",
    keywords: ["spotlight intensity", "glow strength", "brightness", "spotlight power"],
    section: "spotlight",
  },
};

export const PARTICLE_LIST: ParticleDefinition[] = Object.values(PARTICLE_MANIFEST);

/**
 * Normalizes a string for fuzzy token matching.
 */
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/['"“”‘’`]/g, "")
    .replace(/[^a-z0-9.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fuzzy-matches any natural language phrase, particle ID, label, or keyword
 * against the PARTICLE_MANIFEST (and optionally live DOM particles).
 */
export function findParticleByText(
  query: string,
  extraParticles: ParticleDefinition[] = [],
): ParticleDefinition | null {
  const q = normalizeText(query);
  if (!q) return null;

  const pool = [...PARTICLE_LIST, ...extraParticles];

  // 1. Exact ID match
  const exactId = pool.find((p) => p.id.toLowerCase() === q);
  if (exactId) return exactId;

  const tokens = q.split(" ").filter((t) => t.length > 1);

  let bestMatch: ParticleDefinition | null = null;
  let bestScore = 0;

  for (const p of pool) {
    let score = 0;
    const idNorm = normalizeText(p.id.replace(/\./g, " "));
    const labelNorm = normalizeText(p.label);
    const defaultNorm = normalizeText(p.defaultValue);
    const kwNorms = p.keywords.map(normalizeText);

    // Direct substring checks
    if (p.id.toLowerCase().includes(q)) score += 60;
    if (labelNorm.includes(q)) score += 50;
    if (defaultNorm && defaultNorm.includes(q)) score += 40;
    for (const kw of kwNorms) {
      if (kw === q) score += 80;
      else if (kw.includes(q) || q.includes(kw)) score += 45;
    }

    // Token overlap scoring
    for (const token of tokens) {
      if (idNorm.split(" ").includes(token)) score += 18;
      else if (idNorm.includes(token)) score += 10;

      if (labelNorm.split(" ").includes(token)) score += 15;
      else if (labelNorm.includes(token)) score += 8;

      if (defaultNorm.includes(token)) score += 7;

      if (kwNorms.some((k) => k.includes(token))) score += 14;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  return bestScore >= 12 ? bestMatch : null;
}

/**
 * Parses natural language edit commands like:
 *   "change cover title to ABRAR LUXURY"
 *   "set home.sale.cta to Explore Archive"
 *   "replace cover image with /hero/women.jpg"
 */
export function parseNaturalParticleCommand(input: string): {
  targetQuery: string;
  newValue?: string;
} {
  const trimmed = input.trim();

  // Pattern: (change|set|update|replace|edit|make) <target> (to|with|as|=) <newValue>
  const cmdRegex =
    /^(?:change|set|update|replace|edit|make|rename)\s+(.+?)\s+(?:to|with|as|=|->)\s+["']?(.+?)["']?$/i;
  const match = trimmed.match(cmdRegex);
  if (match) {
    return {
      targetQuery: match[1].trim(),
      newValue: match[2].trim(),
    };
  }

  // Pattern: <target> = <newValue> or <target> : <newValue>
  const assignRegex = /^([^=:]+?)\s*(?:=|:|->)\s*["']?(.+?)["']?$/;
  const assignMatch = trimmed.match(assignRegex);
  if (assignMatch && assignMatch[1].trim().length > 2) {
    return {
      targetQuery: assignMatch[1].trim(),
      newValue: assignMatch[2].trim(),
    };
  }

  return { targetQuery: trimmed };
}
