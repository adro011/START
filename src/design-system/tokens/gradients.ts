/**
 * Lamborghini gradient palette.
 *
 * The design system normally forbids gradients — depth is achieved by shifting
 * surface layers from absolute black through progressively lighter grays
 * (`#000000 -> #181818 -> #202020 -> #494949 -> #7D7D7D`). These tokens
 * re-express that same "darkness elevation" as reusable gradients, plus a small
 * set of gold/overlay/light gradients derived strictly from the brand palette.
 *
 * Rules carried over from the system:
 * - Gold is the only chromatic color. Gold gradients are reserved for primary
 *   CTA emphasis, hero accents, and hairline highlights — never as decoration.
 * - All neutrals stay achromatic (pure gray), never tinted.
 * - Nothing rounded, nothing glowing beyond the defined light falloff values.
 */

export const gradients = {
  /**
   * Surface elevation — the "darkness gradient" model.
   * Elevated elements are literally lighter than their surroundings.
   */
  surface: {
    /** Flat abyss — the deepest, near-identical black. */
    abyss: 'linear-gradient(180deg, #000000 0%, #000000 100%)',
    /** Rise out of black toward dark iron. */
    rise: 'linear-gradient(180deg, #000000 0%, #181818 100%)',
    /** Panel sitting above the canvas: dark iron to charcoal. */
    panel: 'linear-gradient(180deg, #181818 0%, #202020 100%)',
    /** Card/panel descending toward graphite. */
    graphite: 'linear-gradient(180deg, #202020 0%, #494949 100%)',
    /** Full elevation ladder in one gradient. */
    elevation: 'linear-gradient(180deg, #000000 0%, #181818 50%, #202020 100%)',
  },

  /**
   * Gold accent — the sole chromatic color (Lamborghini Gold #FFC000 family).
   * Use for CTA emphasis and hero accents only.
   */
  gold: {
    /** Gold text highlight -> gold -> dark gold (hover). */
    solid: 'linear-gradient(135deg, #FFCE3E 0%, #FFC000 50%, #917300 100%)',
    /** Primary CTA default -> hover state. */
    cta: 'linear-gradient(180deg, #FFC000 0%, #917300 100%)',
    /** Soft radial gold bloom for hero backlight (18% max). */
    bloom: 'radial-gradient(circle at center, rgba(255,192,0,0.18) 0%, rgba(255,192,0,0) 70%)',
    /** Horizontal gold hairline that fades at both ends. */
    hairline: 'linear-gradient(90deg, rgba(255,192,0,0) 0%, rgba(255,192,0,0.5) 50%, rgba(255,192,0,0) 100%)',
    /** Subtle gold glow bleeding down from a top edge. */
    edge: 'linear-gradient(180deg, rgba(255,192,0,0.12) 0%, rgba(0,0,0,0) 60%)',
  },

  /**
   * Overlay scrims — legibility gradients laid over full-bleed media.
   */
  overlay: {
    /** Darken the top edge for nav/eyebrow legibility. */
    top: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
    /** Darken the bottom edge for captions/progress. */
    bottom: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
    /** Darken top and bottom edges together (hero framing). */
    edges: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.55) 100%)',
    /** Light uniform scrim for mid-media overlays. */
    scrim: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 100%)',
  },

  /**
   * Light & atmosphere — the "machine under a spotlight" falloff.
   */
  light: {
    /** Cool white spotlight fading into black from the top. */
    spotlight: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 60%)',
    /** Gold-tinted spotlight fading into black from the top. */
    goldSpotlight: 'radial-gradient(circle at 50% 0%, rgba(255,192,0,0.16) 0%, rgba(0,0,0,0) 65%)',
    /** Radial vignette: clear center, darkened edges. */
    vignette: 'radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)',
  },
} as const;

export type Gradients = typeof gradients;
