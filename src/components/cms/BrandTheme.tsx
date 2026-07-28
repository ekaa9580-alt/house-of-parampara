"use client";

import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useWooCommerce";

function hexToRgbChannels(hex?: string): string | null {
  if (!hex) return null;
  const raw = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const n = parseInt(raw, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

/** Applies CMS branding as CSS variables on :root */
export function BrandTheme() {
  const { data: s } = useSiteSettings();

  useEffect(() => {
    if (!s) return;
    const root = document.documentElement;
    const map: Record<string, string | undefined> = {
      "--cms-primary": s.color_primary,
      "--cms-accent": s.color_accent,
      "--cms-gold": s.color_gold || s.color_accent,
      "--cms-ink": s.color_ink,
      "--cms-cream": s.color_cream || s.color_background,
      "--cms-bg": s.color_background,
    };
    Object.entries(map).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });

    const bg = hexToRgbChannels(s.color_background);
    const ink = hexToRgbChannels(s.color_ink);
    const gold = hexToRgbChannels(s.color_gold || s.color_accent);
    if (bg) root.style.setProperty("--background", bg);
    if (ink) root.style.setProperty("--foreground", ink);
    if (gold) root.style.setProperty("--accent", gold);

    if (s.font_display) {
      root.style.setProperty("--font-cms-display", `"${s.font_display}", Georgia, serif`);
    }
    if (s.font_body) {
      root.style.setProperty("--font-cms-body", `"${s.font_body}", system-ui, sans-serif`);
    }

    if (s.favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = s.favicon;
    }
  }, [s]);

  return null;
}

export function AnnouncementBar() {
  const { data: s } = useSiteSettings();
  if (!s?.announcement_enabled || !s.announcement_text) return null;

  return (
    <div className="bg-[var(--cms-primary,#7A3E1D)] px-4 py-2 text-center text-xs tracking-wide text-cream">
      {s.announcement_link ? (
        <a
          href={s.announcement_link}
          className="underline-offset-2 hover:underline"
        >
          {s.announcement_text}
          {s.announcement_link_text ? ` — ${s.announcement_link_text}` : ""}
        </a>
      ) : (
        <span>{s.announcement_text}</span>
      )}
    </div>
  );
}
