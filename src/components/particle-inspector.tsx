"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  PARTICLE_MANIFEST,
  PARTICLE_LIST,
  findParticleByText,
  parseNaturalParticleCommand,
  type ParticleDefinition,
  type ParticleType,
} from "@/config/particles";

const STORAGE_KEY = "abrar_particle_overrides_v1";

export interface ParticleOverride {
  value?: string;
  href?: string;
  src?: string;
  style?: Record<string, string>;
  updatedAt: number;
}

export type OverridesMap = Record<string, ParticleOverride>;

export interface AbrarParticlesAPI {
  list: () => {
    id: string;
    label: string;
    type: ParticleType;
    currentValue: string;
    overridden: boolean;
  }[];
  find: (textQuery: string) => {
    definition: ParticleDefinition | null;
    element: HTMLElement | null;
    id: string | null;
  };
  set: (idOrText: string, newValue: string) => boolean;
  setStyle: (idOrText: string, styleObj: Record<string, string>) => boolean;
  reset: (id?: string) => void;
  exportJSON: () => string;
}

declare global {
  interface Window {
    __ABRAR_PARTICLES__?: AbrarParticlesAPI;
  }
}

const DISCOVER_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, span, a, button, img, figure, section, article, input, label, td, th, dt, dd, blockquote, figcaption";

function inferParticleType(el: HTMLElement): ParticleType {
  const tag = el.tagName.toLowerCase();
  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
    return "heading";
  }
  if (tag === "img") return "image";
  if (tag === "button") return "button";
  if (tag === "a") {
    const cls = el.className || "";
    if (cls.includes("border") || cls.includes("bg-") || cls.includes("px-")) {
      return "button";
    }
    return "link";
  }
  if (tag === "input") return "input";
  if (tag === "section") return "section";
  if (tag === "article" || tag === "figure") return "card";
  const text = (el.textContent || "").trim();
  if (text.startsWith("৳") || el.classList.contains("price")) return "price";
  if (el.classList.contains("kicker") || (text.length > 0 && text.length <= 24 && tag === "span")) {
    return "badge";
  }
  return "text";
}

function slugifySegment(str: string, maxLen = 22): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
}

function resolveSectionPrefix(el: HTMLElement, pathname: string): string {
  const pageKey =
    pathname === "/" || !pathname
      ? "home"
      : slugifySegment(pathname.replace(/^\//, "").replace(/\//g, "."));

  const closestHeader = el.closest("header");
  if (closestHeader) return "header";

  const closestFooter = el.closest("footer");
  if (closestFooter) return "footer";

  const closestSection = el.closest("section, [data-particle-id]");
  if (closestSection && closestSection !== el) {
    const existingId = closestSection.getAttribute("data-particle-id");
    if (existingId) {
      return existingId.replace(/\.section$/, "");
    }
    const aria = closestSection.getAttribute("aria-label");
    if (aria) {
      return `${pageKey}.${slugifySegment(aria)}`;
    }
  }

  return pageKey;
}

function loadOverridesFromStorage(): OverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OverridesMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOverridesToStorage(map: OverridesMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

function applyOverrideToElement(el: HTMLElement, override: ParticleOverride): void {
  const tag = el.tagName.toLowerCase();
  if (override.value !== undefined) {
    if (tag === "img") {
      el.setAttribute("src", override.value);
      el.removeAttribute("srcset");
    } else if (tag === "input") {
      (el as HTMLInputElement).placeholder = override.value;
    } else {
      // Preserve child decorative arrow/icon spans if only text node exists
      const hasComplexChildren = Array.from(el.children).some(
        (c) => c.tagName.toLowerCase() === "img" || c.tagName.toLowerCase() === "svg",
      );
      if (!hasComplexChildren) {
        el.textContent = override.value;
      }
    }
  }
  if (override.src && tag === "img") {
    el.setAttribute("src", override.src);
    el.removeAttribute("srcset");
  }
  if (override.href && tag === "a") {
    el.setAttribute("href", override.href);
  }
  if (override.style) {
    for (const [k, v] of Object.entries(override.style)) {
      el.style.setProperty(k, v);
    }
  }
}

function applySpotlightConfigOverride(id: string, value: string): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (id === "spotlight.config.color") {
    root.style.setProperty("--spotlight-accent", value);
    root.style.setProperty("--gold", value);
  } else if (id === "spotlight.config.bg") {
    root.style.setProperty("--spotlight-bg", value);
  } else if (id === "spotlight.config.intensity") {
    root.style.setProperty("--spotlight-intensity", value);
  }
}

export default function ParticleInspector() {
  const pathname = usePathname();
  const [studioOpen, setStudioOpen] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<OverridesMap>({});
  const [particleCount, setParticleCount] = useState<number>(0);

  const [hoveredInfo, setHoveredInfo] = useState<{
    id: string;
    label: string;
    type: string;
    rect: { top: number; left: number; width: number; height: number };
  } | null>(null);

  const [selectedParticle, setSelectedParticle] = useState<{
    id: string;
    label: string;
    type: ParticleType;
    value: string;
    href?: string;
    src?: string;
    color?: string;
  } | null>(null);

  const overridesRef = useRef<OverridesMap>({});
  overridesRef.current = overrides;

  /**
   * 1. Auto-discover & tag 100% of DOM particles and apply stored overrides.
   */
  const scanAndHydrateDOM = useCallback(() => {
    if (typeof document === "undefined") return;

    // Step A: Bind manifest definitions by CSS selector if not yet tagged
    for (const def of PARTICLE_LIST) {
      if (def.selector === ":root") continue;
      try {
        const matches = document.querySelectorAll<HTMLElement>(def.selector);
        matches.forEach((el, idx) => {
          if (el.closest("[data-particle-studio-ui]")) return;
          if (!el.getAttribute("data-particle-id")) {
            const assignedId = idx === 0 ? def.id : `${def.id}.${String(idx + 1).padStart(2, "0")}`;
            el.setAttribute("data-particle-id", assignedId);
          }
          if (!el.getAttribute("data-particle-type")) {
            el.setAttribute("data-particle-type", def.type);
          }
          if (!el.getAttribute("data-particle-label")) {
            el.setAttribute("data-particle-label", def.label);
          }
          el.setAttribute("data-editable", "true");
        });
      } catch {
        // selector may be invalid in edge cases
      }
    }

    // Step B: Auto-discover all remaining DOM elements so zero particles are untagged
    const allElements = document.querySelectorAll<HTMLElement>(DISCOVER_SELECTOR);
    const counters: Record<string, number> = {};
    let totalTagged = 0;

    allElements.forEach((el) => {
      if (el.closest("[data-particle-studio-ui]")) return;
      if (el.getAttribute("aria-hidden") === "true" && !el.textContent?.trim() && el.tagName.toLowerCase() !== "img") {
        return;
      }

      let pid = el.getAttribute("data-particle-id");
      let ptype = el.getAttribute("data-particle-type") as ParticleType | null;
      let plabel = el.getAttribute("data-particle-label");

      if (!ptype) {
        ptype = inferParticleType(el);
        el.setAttribute("data-particle-type", ptype);
      }

      if (!pid) {
        const prefix = resolveSectionPrefix(el, pathname || "/");
        const tag = el.tagName.toLowerCase();
        const rawText = (
          el.getAttribute("aria-label") ||
          el.getAttribute("alt") ||
          el.textContent ||
          ""
        ).trim();
        const hint = slugifySegment(rawText, 18) || tag;
        const counterKey = `${prefix}.${ptype}.${hint}`;
        counters[counterKey] = (counters[counterKey] || 0) + 1;
        const count = counters[counterKey];
        pid =
          count === 1
            ? `${prefix}.${ptype}.${hint}`
            : `${prefix}.${ptype}.${hint}.${String(count).padStart(2, "0")}`;
        el.setAttribute("data-particle-id", pid);
      }

      if (!plabel) {
        const snippet = (
          el.getAttribute("aria-label") ||
          el.getAttribute("alt") ||
          el.textContent ||
          pid
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 48);
        plabel = `${ptype.toUpperCase()}: ${snippet || pid}`;
        el.setAttribute("data-particle-label", plabel);
      }

      if (!el.getAttribute("data-editable")) {
        el.setAttribute("data-editable", "true");
      }

      totalTagged += 1;

      // Apply override if one exists for this particle ID
      const ov = overridesRef.current[pid];
      if (ov) {
        applyOverrideToElement(el, ov);
      }
    });

    // Apply spotlight config overrides if present
    for (const [id, ov] of Object.entries(overridesRef.current)) {
      if (id.startsWith("spotlight.config.") && ov.value) {
        applySpotlightConfigOverride(id, ov.value);
      }
    }

    setParticleCount(totalTagged);
  }, [pathname]);

  /**
   * Locate a DOM element + definition by exact ID or natural language text query
   */
  const resolveParticleTarget = useCallback((idOrQuery: string): {
    id: string | null;
    element: HTMLElement | null;
    definition: ParticleDefinition | null;
  } => {
    if (typeof document === "undefined") {
      return { id: null, element: null, definition: null };
    }

    const q = idOrQuery.trim();
    if (!q) return { id: null, element: null, definition: null };

    // 1. Direct DOM match by data-particle-id
    const directEl = document.querySelector<HTMLElement>(
      `[data-particle-id="${CSS.escape(q)}"]`,
    );
    if (directEl) {
      return {
        id: q,
        element: directEl,
        definition: PARTICLE_MANIFEST[q] ?? null,
      };
    }

    // 2. Collect live DOM particles as extra candidates for fuzzy search
    const liveDefs: ParticleDefinition[] = [];
    document
      .querySelectorAll<HTMLElement>("[data-particle-id]")
      .forEach((el) => {
        if (el.closest("[data-particle-studio-ui]")) return;
        const pid = el.getAttribute("data-particle-id") || "";
        if (!pid || PARTICLE_MANIFEST[pid]) return;
        const label = el.getAttribute("data-particle-label") || pid;
        const ptype = (el.getAttribute("data-particle-type") as ParticleType) || "text";
        const text = (el.textContent || el.getAttribute("alt") || "").trim().slice(0, 80);
        liveDefs.push({
          id: pid,
          label,
          type: ptype,
          defaultValue: text,
          selector: `[data-particle-id="${CSS.escape(pid)}"]`,
          keywords: [label.toLowerCase(), text.toLowerCase()],
        });
      });

    const matchedDef = findParticleByText(q, liveDefs);
    if (matchedDef) {
      if (matchedDef.id.startsWith("spotlight.config.")) {
        return { id: matchedDef.id, element: document.documentElement, definition: matchedDef };
      }
      const el =
        document.querySelector<HTMLElement>(
          `[data-particle-id="${CSS.escape(matchedDef.id)}"]`,
        ) || document.querySelector<HTMLElement>(matchedDef.selector);
      return {
        id: matchedDef.id,
        element: el,
        definition: matchedDef,
      };
    }

    return { id: null, element: null, definition: null };
  }, []);

  /**
   * Update a particle value and persist to localStorage
   */
  const updateParticle = useCallback(
    (
      idOrQuery: string,
      patch: Partial<Omit<ParticleOverride, "updatedAt">>,
    ): boolean => {
      const target = resolveParticleTarget(idOrQuery);
      const id = target.id;
      if (!id) return false;

      const nextOverrides: OverridesMap = {
        ...overridesRef.current,
        [id]: {
          ...(overridesRef.current[id] || {}),
          ...patch,
          updatedAt: Date.now(),
        },
      };

      overridesRef.current = nextOverrides;
      setOverrides(nextOverrides);
      saveOverridesToStorage(nextOverrides);

      if (id.startsWith("spotlight.config.") && patch.value !== undefined) {
        applySpotlightConfigOverride(id, patch.value);
        return true;
      }

      if (target.element) {
        applyOverrideToElement(target.element, nextOverrides[id]);
        return true;
      }
      return false;
    },
    [resolveParticleTarget],
  );

  // Load initial overrides and hydrate DOM
  useEffect(() => {
    const stored = loadOverridesFromStorage();
    overridesRef.current = stored;
    setOverrides(stored);
    scanAndHydrateDOM();

    const timer = window.setTimeout(scanAndHydrateDOM, 450);
    return () => window.clearTimeout(timer);
  }, [pathname, scanAndHydrateDOM]);

  // Expose window.__ABRAR_PARTICLES__
  useEffect(() => {
    if (typeof window === "undefined") return;

    const api: AbrarParticlesAPI = {
      list: () => {
        const result: ReturnType<AbrarParticlesAPI["list"]> = [];
        const seen = new Set<string>();
        document.querySelectorAll<HTMLElement>("[data-particle-id]").forEach((el) => {
          if (el.closest("[data-particle-studio-ui]")) return;
          const id = el.getAttribute("data-particle-id") || "";
          if (!id || seen.has(id)) return;
          seen.add(id);
          const label = el.getAttribute("data-particle-label") || id;
          const type = (el.getAttribute("data-particle-type") as ParticleType) || "text";
          const currentValue =
            el.tagName.toLowerCase() === "img"
              ? el.getAttribute("src") || ""
              : (el.textContent || "").trim().slice(0, 120);
          result.push({
            id,
            label,
            type,
            currentValue,
            overridden: Boolean(overridesRef.current[id]),
          });
        });
        return result;
      },
      find: (textQuery: string) => {
        const res = resolveParticleTarget(textQuery);
        return {
          definition: res.definition,
          element: res.element,
          id: res.id,
        };
      },
      set: (idOrText: string, newValue: string) => {
        return updateParticle(idOrText, { value: newValue });
      },
      setStyle: (idOrText: string, styleObj: Record<string, string>) => {
        return updateParticle(idOrText, { style: styleObj });
      },
      reset: (id?: string) => {
        if (id) {
          const next = { ...overridesRef.current };
          delete next[id];
          overridesRef.current = next;
          setOverrides(next);
          saveOverridesToStorage(next);
        } else {
          overridesRef.current = {};
          setOverrides({});
          window.localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }
      },
      exportJSON: () => JSON.stringify(overridesRef.current, null, 2),
    };

    window.__ABRAR_PARTICLES__ = api;
  }, [resolveParticleTarget, updateParticle]);

  // Keyboard shortcut Alt+P to toggle Particle Studio
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setStudioOpen((prev) => {
          const next = !prev;
          setInspectMode(next);
          return next;
        });
      } else if (e.key === "Escape" && inspectMode) {
        setInspectMode(false);
        setHoveredInfo(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectMode]);

  // Live hover & click handler when Inspect Mode is active
  useEffect(() => {
    if (!inspectMode) {
      setHoveredInfo(null);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("[data-particle-studio-ui]")) {
        setHoveredInfo(null);
        return;
      }
      const particleEl = target.closest<HTMLElement>("[data-particle-id]");
      if (!particleEl) {
        setHoveredInfo(null);
        return;
      }
      const rect = particleEl.getBoundingClientRect();
      setHoveredInfo({
        id: particleEl.getAttribute("data-particle-id") || "",
        label: particleEl.getAttribute("data-particle-label") || "",
        type: particleEl.getAttribute("data-particle-type") || "text",
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("[data-particle-studio-ui]")) return;
      const particleEl = target.closest<HTMLElement>("[data-particle-id]");
      if (!particleEl) return;

      e.preventDefault();
      e.stopPropagation();

      const id = particleEl.getAttribute("data-particle-id") || "";
      const label = particleEl.getAttribute("data-particle-label") || id;
      const type = (particleEl.getAttribute("data-particle-type") as ParticleType) || "text";
      const tag = particleEl.tagName.toLowerCase();

      setSelectedParticle({
        id,
        label,
        type,
        value:
          tag === "img"
            ? particleEl.getAttribute("src") || ""
            : (particleEl.textContent || "").trim(),
        href: tag === "a" ? particleEl.getAttribute("href") || "" : undefined,
        src: tag === "img" ? particleEl.getAttribute("src") || "" : undefined,
        color: overridesRef.current[id]?.style?.color || "",
      });

      // Enable inline contentEditable for text/heading/badge/button/price elements
      if (tag !== "img" && tag !== "input" && tag !== "section") {
        particleEl.contentEditable = "true";
        particleEl.focus();
        const onBlur = () => {
          particleEl.removeAttribute("contenteditable");
          const updatedText = (particleEl.textContent || "").trim();
          if (updatedText) {
            updateParticle(id, { value: updatedText });
            setStatusMessage(`Saved inline edit to ${id}`);
          }
          particleEl.removeEventListener("blur", onBlur);
        };
        particleEl.addEventListener("blur", onBlur);
      }
    };

    window.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("mousemove", onMouseMove, true);
      window.removeEventListener("click", onClick, true);
    };
  }, [inspectMode, updateParticle]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const { targetQuery, newValue } = parseNaturalParticleCommand(commandInput);
    const resolved = resolveParticleTarget(targetQuery);

    if (!resolved.id) {
      setStatusMessage(`No particle matched "${targetQuery}". Try another keyword.`);
      return;
    }

    if (resolved.element && resolved.element !== document.documentElement) {
      resolved.element.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = resolved.element.getBoundingClientRect();
      setHoveredInfo({
        id: resolved.id,
        label:
          resolved.element.getAttribute("data-particle-label") ||
          resolved.definition?.label ||
          resolved.id,
        type:
          resolved.element.getAttribute("data-particle-type") ||
          resolved.definition?.type ||
          "text",
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
      });
    }

    if (newValue !== undefined) {
      updateParticle(resolved.id, { value: newValue });
      setStatusMessage(`Updated [${resolved.id}] → "${newValue}"`);
      setCommandInput("");
    } else if (resolved.element) {
      const tag = resolved.element.tagName.toLowerCase();
      setSelectedParticle({
        id: resolved.id,
        label:
          resolved.element.getAttribute("data-particle-label") ||
          resolved.definition?.label ||
          resolved.id,
        type:
          (resolved.element.getAttribute("data-particle-type") as ParticleType) ||
          resolved.definition?.type ||
          "text",
        value:
          tag === "img"
            ? resolved.element.getAttribute("src") || ""
            : (resolved.element.textContent || "").trim(),
        href: tag === "a" ? resolved.element.getAttribute("href") || "" : undefined,
        src: tag === "img" ? resolved.element.getAttribute("src") || "" : undefined,
      });
      setStatusMessage(`Located [${resolved.id}]`);
    }
  };

  const overrideCount = Object.keys(overrides).length;

  return (
    <div data-particle-studio-ui="true">
      {/* Live Hover Highlight Box & Floating Particle Badge */}
      {inspectMode && hoveredInfo && (
        <div
          style={{
            position: "fixed",
            top: `${hoveredInfo.rect.top}px`,
            left: `${hoveredInfo.rect.left}px`,
            width: `${hoveredInfo.rect.width}px`,
            height: `${hoveredInfo.rect.height}px`,
            pointerEvents: "none",
            zIndex: 89,
            border: "1.5px solid var(--abrar-accent)",
            backgroundColor: "rgba(255, 214, 0, 0.07)",
            boxShadow: "0 0 24px rgba(255, 214, 0, 0.25)",
            transition: "all 80ms ease-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: hoveredInfo.rect.top < 36 ? "100%" : "-28px",
              left: 0,
              backgroundColor: "var(--color-black)",
              color: "var(--abrar-accent)",
              border: "1px solid var(--abrar-accent)",
              padding: "2px 8px",
              fontSize: "10px",
              fontFamily: "monospace",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.85)",
            }}
          >
            <span style={{ fontWeight: 700 }}>{hoveredInfo.id}</span>
            <span style={{ color: "rgba(255,255,255,0.65)" }}>· {hoveredInfo.type}</span>
          </div>
        </div>
      )}

      {/* Floating Studio Drawer */}
      {studioOpen && (
        <aside
          aria-label="Particle Studio Inspector"
          style={{ zIndex: 90 }}
          className="fixed right-5 bottom-16 w-[360px] max-w-[calc(100vw-2.5rem)] border border-[var(--abrar-accent)]/70 bg-[#080808]/95 p-4 text-[var(--color-smoke)] shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--abrar-accent)] uppercase">
                ✦ Particle Studio
              </p>
              <p className="mt-0.5 text-[11px] text-white/60">
                {particleCount} live particles · {overrideCount} custom overrides
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInspectMode((v) => !v)}
                className={`border px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                  inspectMode
                    ? "border-[var(--abrar-accent)] bg-[var(--abrar-accent)] text-black"
                    : "border-white/25 text-white/80 hover:border-[var(--abrar-accent)]"
                }`}
              >
                {inspectMode ? "Inspecting" : "Inspect"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudioOpen(false);
                  setInspectMode(false);
                }}
                aria-label="Close Particle Studio"
                className="px-1.5 text-[14px] text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Natural Language Command / Search Bar */}
          <form onSubmit={handleCommandSubmit} className="mt-3">
            <label className="block text-[10px] font-semibold tracking-[0.18em] text-white/65 uppercase">
              Text Command / Search Particle
            </label>
            <div className="mt-1.5 flex gap-1.5">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder='e.g. "change cover title to ABRAR LUXURY"'
                className="flex-1 border border-white/20 bg-black px-2.5 py-2 text-[12px] text-white placeholder:text-white/35 focus:border-[var(--abrar-accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[var(--abrar-accent)] px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-black uppercase hover:bg-white"
              >
                Run
              </button>
            </div>
          </form>

          {statusMessage && (
            <p className="mt-2 border border-[var(--abrar-accent)]/30 bg-[var(--abrar-accent)]/10 px-2.5 py-1.5 text-[11px] text-[var(--abrar-accent)]">
              {statusMessage}
            </p>
          )}

          {/* Selected Particle Quick Editor */}
          {selectedParticle && (
            <div className="mt-3 border-t border-white/15 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-[var(--abrar-accent)]">
                  {selectedParticle.id}
                </span>
                <span className="text-[10px] tracking-[0.14em] text-white/50 uppercase">
                  {selectedParticle.type}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-white/65">
                {selectedParticle.label}
              </p>

              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-[10px] tracking-[0.14em] text-white/55 uppercase">
                    {selectedParticle.type === "image" ? "Image URL (src)" : "Text / Content"}
                  </label>
                  <input
                    type="text"
                    value={selectedParticle.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedParticle({ ...selectedParticle, value: val });
                      updateParticle(selectedParticle.id, { value: val });
                    }}
                    className="mt-1 w-full border border-white/20 bg-black px-2.5 py-1.5 text-[12px] text-white focus:border-[var(--abrar-accent)] focus:outline-none"
                  />
                </div>

                {selectedParticle.href !== undefined && (
                  <div>
                    <label className="block text-[10px] tracking-[0.14em] text-white/55 uppercase">
                      Link Destination (href)
                    </label>
                    <input
                      type="text"
                      value={selectedParticle.href}
                      onChange={(e) => {
                        const href = e.target.value;
                        setSelectedParticle({ ...selectedParticle, href });
                        updateParticle(selectedParticle.id, { href });
                      }}
                      className="mt-1 w-full border border-white/20 bg-black px-2.5 py-1.5 text-[12px] text-white focus:border-[var(--abrar-accent)] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      window.__ABRAR_PARTICLES__?.reset(selectedParticle.id);
                      setStatusMessage(`Reset ${selectedParticle.id}`);
                    }}
                    className="border border-white/20 px-2.5 py-1 text-[10px] tracking-[0.14em] text-white/75 uppercase hover:border-white"
                  >
                    Reset Particle
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedParticle(null)}
                    className="text-[10px] tracking-[0.14em] text-white/50 uppercase hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] text-white/55">
            <span>Click any element to inline-edit</span>
            {overrideCount > 0 && (
              <button
                type="button"
                onClick={() => window.__ABRAR_PARTICLES__?.reset()}
                className="font-semibold text-[var(--abrar-accent)] uppercase hover:underline"
              >
                Reset All ({overrideCount})
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Sleek Bottom-Right Floating Pill */}
      <button
        type="button"
        onClick={() => {
          setStudioOpen((prev) => {
            const next = !prev;
            setInspectMode(next);
            return next;
          });
        }}
        title="Toggle Live Particle Studio (Alt+P)"
        style={{ zIndex: 90 }}
        className="fixed right-5 bottom-5 flex items-center gap-2 border border-[var(--abrar-accent)] bg-[var(--color-black)] px-3.5 py-2 text-[11px] font-bold tracking-[0.2em] text-[var(--abrar-accent)] uppercase shadow-[0_8px_28px_rgba(0,0,0,0.85)] transition-all duration-200 hover:bg-[var(--abrar-accent)] hover:text-black"
      >
        <span>✦ PARTICLE STUDIO</span>
        {overrideCount > 0 && (
          <span className="rounded-full bg-[var(--abrar-accent)] px-1.5 py-0.5 text-[9px] font-extrabold text-black">
            {overrideCount}
          </span>
        )}
      </button>
    </div>
  );
}
