"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProfileLinkTarget, ProfileLinks } from "@/data/loaders/types";

const SHOW_DELAY_MS = 280;
const GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

interface ProfileHoverLinkProps {
  profile: ProfileLinkTarget;
  className?: string;
  children: React.ReactNode;
}

function canHoverPointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * 사람 프로필 링크.
 * 클릭하면 기존과 같이 프로필 페이지로 이동하고, 포인터를 올리면 얼굴과 짧은 소개가 뜬다.
 * 호버가 없는 터치 기기에서는 툴팁 없이 클릭만 동작한다.
 */
export function ProfileHoverLink({ profile, className, children }: ProfileHoverLinkProps) {
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
            className={`pointer-events-none fixed z-[120] w-max max-w-[min(320px,calc(100vw-16px))] ${
              pos.ready ? "visible" : "invisible"
            }`}
          >
            <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white p-2 pr-3 shadow-lg">
              <div className="relative h-[84px] w-[68px] shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={profile.photo}
                  alt=""
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 py-0.5">
                <p className="text-[15px] font-medium leading-tight text-gray-900">{profile.nameEn}</p>
                {profile.nameKo ? (
                  <p className="mt-0.5 text-[13px] leading-tight text-gray-600">{profile.nameKo}</p>
                ) : null}
                {profile.title ? (
                  <p className="mt-1 text-[12.5px] font-medium leading-snug text-gray-800">{profile.title}</p>
                ) : null}
                {profile.summary ? (
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-gray-500">{profile.summary}</p>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Link
        ref={anchorRef}
        href={profile.href}
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

/** 프로필이 있는 저자만 링크와 호버 카드로, 없으면 그대로 텍스트로. */
export function ProfileAuthorName({
  authorId,
  name,
  profileLinks,
  className,
}: {
  authorId?: string;
  name: string;
  profileLinks?: ProfileLinks;
  className: string;
}) {
  const profile = authorId ? profileLinks?.[authorId] : undefined;
  if (!profile) return <span className={className}>{name}</span>;

  return (
    <ProfileHoverLink
      profile={profile}
      className={`${className} decoration-gray-500 underline underline-offset-[3px] hover:text-brand-primary hover:decoration-brand-primary transition-colors`}
    >
      {name}
    </ProfileHoverLink>
  );
}
