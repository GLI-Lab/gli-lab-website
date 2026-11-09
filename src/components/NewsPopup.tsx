"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IoAlertCircleOutline, IoClose } from "react-icons/io5";
import type { NewsPopupAlert } from "@/lib/newsPaper";

const NEWS_POPUP_ROOT_ID = "news-popup-root";
const BANNER_HEIGHT_CSS_VAR = "--news-banner-height";
const DISMISS_STORAGE_KEY = "gli-lab:news-banner-dismissed";
const DISMISS_DURATION_MS = 30 * 60 * 1000;
const BOLD_PATTERN = /<b>([^<]+)<\/b>/g;

type DismissedMap = Record<string, number>;

function readDismissed(): DismissedMap {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DismissedMap;
    const now = Date.now();
    const next: DismissedMap = {};
    for (const [id, expiresAt] of Object.entries(parsed)) {
      if (typeof expiresAt === "number" && expiresAt > now) {
        next[id] = expiresAt;
      }
    }
    return next;
  } catch {
    return {};
  }
}

function writeDismissed(map: DismissedMap) {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // private mode / quota
  }
}

function renderHeadlineWithBold(text: string, keyPrefix: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  BOLD_PATTERN.lastIndex = 0;
  while ((match = BOLD_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-text-${partIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </span>,
      );
    }
    nodes.push(
      <strong
        key={`${keyPrefix}-bold-${partIndex++}`}
        className="font-semibold underline underline-offset-2"
      >
        {match[1]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <span key={`${keyPrefix}-text-${partIndex++}`}>
        {text.slice(lastIndex)}
      </span>,
    );
  }

  return nodes.length > 0 ? nodes : text;
}

interface NewsPopupProps {
  alerts: NewsPopupAlert[];
}

export default function NewsPopup({ alerts }: NewsPopupProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const fallbackTimers = useRef<Map<string, number>>(new Map());
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [visibleAlerts, setVisibleAlerts] = useState<NewsPopupAlert[]>([]);
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      for (const timer of fallbackTimers.current.values()) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    const dismissed = readDismissed();
    const now = Date.now();
    setVisibleAlerts(
      alerts.filter((alert) => {
        if (exitingIds.includes(alert.id)) return true;
        return (dismissed[alert.id] ?? 0) <= now;
      }),
    );
  }, [alerts, exitingIds]);

  useEffect(() => {
    const nav = document.body.querySelector("nav");
    if (!nav) return;

    let root = document.getElementById(NEWS_POPUP_ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = NEWS_POPUP_ROOT_ID;
      nav.insertAdjacentElement("afterend", root);
    }
    root.className = "relative z-[58]";
    setPortalRoot(root);

    return () => {
      root?.remove();
      setPortalRoot(null);
      document.documentElement.style.removeProperty(BANNER_HEIGHT_CSS_VAR);
    };
  }, []);

  useLayoutEffect(() => {
    const el = bannerRef.current;
    if (!el) {
      setBannerHeight(0);
      document.documentElement.style.removeProperty(BANNER_HEIGHT_CSS_VAR);
      return;
    }

    const update = () => {
      const next = el.offsetHeight;
      setBannerHeight(next);
      if (next > 0) {
        document.documentElement.style.setProperty(
          BANNER_HEIGHT_CSS_VAR,
          `${next}px`,
        );
      } else {
        document.documentElement.style.removeProperty(BANNER_HEIGHT_CSS_VAR);
      }
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [portalRoot, visibleAlerts, exitingIds]);

  const finishExit = (id: string) => {
    const timer = fallbackTimers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      fallbackTimers.current.delete(id);
    }
    setVisibleAlerts((prev) => prev.filter((alert) => alert.id !== id));
    setExitingIds((current) => current.filter((exitingId) => exitingId !== id));
  };

  const dismiss = (id: string) => {
    if (fallbackTimers.current.has(id)) return;
    const next = { ...readDismissed(), [id]: Date.now() + DISMISS_DURATION_MS };
    writeDismissed(next);
    setExitingIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    const timer = window.setTimeout(() => finishExit(id), 2500);
    fallbackTimers.current.set(id, timer);
  };

  const fixedBanner = (
    <div
      ref={bannerRef}
      className="fixed left-0 right-0 z-[58] w-full border-b border-brand-primary/25 bg-[#f0f5f1] shadow-md animate-fade-up"
      style={{ top: "var(--header-height, 76px)" }}
      role="region"
      aria-label="Latest news highlights"
    >
      {visibleAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`w-full ${
                exitingIds.includes(alert.id)
                  ? "animate-banner-toast-out"
                  : "transition-colors hover:bg-brand-primary/10"
              }`}
              onAnimationEnd={
                exitingIds.includes(alert.id)
                  ? (event) => {
                      if (event.target !== event.currentTarget) return;
                      finishExit(alert.id);
                    }
                  : undefined
              }
            >
            {exitingIds.includes(alert.id) ? (
            <p
              role="status"
              aria-live="polite"
              className={`max-w-screen-xl mx-auto px-4 py-2 text-sm md:text-base text-gray-700 text-center leading-snug${
                index > 0 ? " border-t border-brand-primary/25" : ""
              }`}
            >
              This banner will be hidden for 30 minutes.
            </p>
            ) : (
            <div
              className={`max-w-screen-xl mx-auto px-4 flex items-start gap-3 py-2${
                index > 0 ? " border-t border-brand-primary/25" : ""
              }`}
            >
              <IoAlertCircleOutline
                className="hidden md:block mt-0.5 shrink-0 text-brand-primary"
                size={22}
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-0.5">
              {alert.headline && (
                <p className="text-sm md:text-base font-medium text-gray-900 leading-snug">
                  {renderHeadlineWithBold(alert.headline, alert.id)}
                </p>
              )}
              <div className="hidden md:flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                {alert.items.map((item, itemIdx) => (
                  <span
                    key={`${item.kind}-${item.title}`}
                    className="inline-flex min-w-0 max-w-full"
                  >
                    {/* {itemIdx > 0 && (
                      <span className="text-gray-300 mr-2" aria-hidden>
                        |
                      </span>
                    )} */}
                    <Link
                      href={item.href}
                      className="text-sm md:text-base text-gray-600 hover:text-brand-primary underline-offset-2 hover:underline leading-snug line-clamp-1"
                    >
                      {item.title}
                    </Link>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 self-center">
              <Link
                href="/board/news"
                className="hidden md:inline text-sm md:text-base text-gray-600 hover:text-brand-primary whitespace-nowrap transition-colors md:px-1"
              >
                All news →
              </Link>
              <button
                type="button"
                onClick={() => dismiss(alert.id)}
                className="p-1 rounded-md mt-0.5 text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-colors"
                aria-label="Hide for 30 minutes"
              >
                <IoClose size={22} />
              </button>
            </div>
            </div>
            )}
          </div>
        ))}
    </div>
  );

  if (visibleAlerts.length === 0) return null;

  return (
    <>
      {bannerHeight > 0 && (
        <div
          aria-hidden
          className="w-full shrink-0 transition-[height] duration-300"
          style={{ height: bannerHeight }}
        />
      )}
      {portalRoot && visibleAlerts.length > 0
        ? createPortal(fixedBanner, portalRoot)
        : null}
    </>
  );
}
