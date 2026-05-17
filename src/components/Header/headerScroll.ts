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

/**
 * `#site-header-bar` 높이를 측정해 state와 `:root`의 `--header-height`에 반영합니다.
 * 포함: 로고 행(항상), 데스크톱 메인 내비(md+). 모바일은 로고 행만.
 * 제외: 모바일 펼침 메뉴·데스크톱 드롭다운(오버레이, 레이아웃 높이에 미포함).
 * 용도: Header spacer·배경, NewsPopup 배너 top, 모바일 메뉴 top. 초기값 76px.
 */
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
