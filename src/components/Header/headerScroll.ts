"use client";

import { useEffect, useState } from "react";

export const HEADER_SCROLL_THRESHOLD = 10;
export const SITE_HEADER_BAR_ID = "site-header-bar";

/** Fallback before mount / measure */
const DEFAULT_HEADER_HEIGHT = 76;

export function useHeaderScrolled(): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
}

/** Measured height of the fixed header bar (logo + nav row) */
export function useHeaderHeight(): number {
  const [height, setHeight] = useState(DEFAULT_HEADER_HEIGHT);

  useEffect(() => {
    const el = document.getElementById(SITE_HEADER_BAR_ID);
    if (!el) return;

    const update = () => {
      const next = el.getBoundingClientRect().bottom;
      setHeight(next);
      document.documentElement.style.setProperty("--header-height", `${next}px`);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return height;
}
