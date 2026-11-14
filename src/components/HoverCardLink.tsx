"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SHOW_DELAY_MS = 280;
const GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

interface HoverCardLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  card: React.ReactNode;
  panelClassName?: string;
}

function canHoverPointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * 클릭하면 href로 이동하고, 포인터를 올리면 card가 뜬다.
 * 호버가 없는 터치 기기에서는 카드 없이 클릭만 동작한다.
 */
export function HoverCardLink({
  href,
  className,
  children,
  card,
  panelClassName = "w-max max-w-[min(370px,calc(100vw-16px))]",
}: HoverCardLinkProps) {
  const tipId = useId();
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current);
    };
  }, []);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;

    const rect = anchor.getBoundingClientRect();
    const offscreen =
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > window.innerWidth;
    if (offscreen) {
      setOpen(false);
      return;
    }

    const tipRect = tip.getBoundingClientRect();
    const spaceBelow = window.innerHeight - VIEWPORT_MARGIN_PX - rect.bottom - GAP_PX;
    const top =
      tipRect.height > spaceBelow && rect.top - GAP_PX - tipRect.height >= VIEWPORT_MARGIN_PX
        ? rect.top - GAP_PX - tipRect.height
        : rect.bottom + GAP_PX;
    const maxLeft = window.innerWidth - VIEWPORT_MARGIN_PX - tipRect.width;
    const left = Math.max(VIEWPORT_MARGIN_PX, Math.min(rect.left, maxLeft));

    setPos((prev) =>
      prev.ready && prev.top === top && prev.left === left ? prev : { top, left, ready: true },
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, place]);

  const clearShowTimer = () => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  const show = (immediate: boolean) => {
    if (!canHoverPointer()) return;
    clearShowTimer();
    if (immediate) {
      setPos((prev) => ({ ...prev, ready: false }));
      setOpen(true);
      return;
    }
    showTimerRef.current = window.setTimeout(() => {
      setPos((prev) => ({ ...prev, ready: false }));
      setOpen(true);
    }, SHOW_DELAY_MS);
  };

  const hide = () => {
    clearShowTimer();
    setOpen(false);
  };

  const tooltip =
    open && mounted
      ? createPortal(
          <div
            ref={tipRef}
            id={tipId}
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className={`pointer-events-none fixed z-[120] ${panelClassName} ${
              pos.ready ? "visible" : "invisible"
            }`}
          >
            {card}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Link
        ref={anchorRef}
        href={href}
        className={className}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => show(false)}
        onMouseLeave={hide}
        onFocus={() => show(true)}
        onBlur={hide}
      >
        {children}
      </Link>
      {tooltip}
    </>
  );
}
