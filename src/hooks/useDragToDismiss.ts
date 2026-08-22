'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';

interface UseDragToDismissOptions {
  /** 드래그에 따라 실제로 움직이는 시트 */
  sheetRef: RefObject<HTMLElement | null>;
  /** 드래그 진행에 맞춰 투명해지는 배경 */
  backdropRef: RefObject<HTMLElement | null>;
  /** 시트 안의 스크롤 영역. 맨 위일 때만 드래그가 시작된다. */
  contentRef: RefObject<HTMLElement | null>;
  /** 스크롤 위치와 상관없이 드래그를 시작할 수 있는 손잡이 */
  handleRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** 드래그가 실제로 시작되는 순간 (탭·스와이프 판정을 취소할 때 사용) */
  onDragStart?: () => void;
  /** 모달이 화면에 있는 동안만 true */
  enabled?: boolean;
  backdropOpacity?: number;
}

const DETECT_SLOP = 6;
const FLICK_VELOCITY = 0.45; // px/ms
const PROJECTION_MS = 220;

export function useDragToDismiss({
  sheetRef,
  backdropRef,
  contentRef,
  handleRef,
  onClose,
  onDragStart,
  enabled = true,
  backdropOpacity = 0.75,
}: UseDragToDismissOptions) {
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onDragStartRef = useRef(onDragStart);

  useEffect(() => {
    onCloseRef.current = onClose;
    onDragStartRef.current = onDragStart;
  }, [onClose, onDragStart]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    closingRef.current = false;

    const sheetEl = sheetRef.current;
    const contentEl = contentRef.current;
    const backdropEl = backdropRef.current;
    const handleEl = handleRef?.current ?? null;
    if (!sheetEl || !contentEl || !backdropEl) return;

    let mode: 'idle' | 'detect' | 'drag' = 'idle';
    let touchId: number | null = null;
    let startX = 0;
    let startY = 0;
    let offset = 0;
    let fromHandle = false;
    let samples: { y: number; t: number }[] = [];
    let closeTimer: number | null = null;

    const dismissDistance = () => {
      const height = sheetEl.getBoundingClientRect().height || window.innerHeight;
      return Math.min(280, Math.max(120, height * 0.3));
    };

    const applyVisual = (y: number) => {
      const clamped = Math.max(0, y);
      const progress = Math.min(1, clamped / (window.innerHeight * 0.5));
      sheetEl.style.transform = `translate3d(0, ${clamped}px, 0)`;
      backdropEl.style.backgroundColor = `rgba(0,0,0,${backdropOpacity * (1 - progress * 0.8)})`;
    };

    const track = (y: number) => {
      const now = performance.now();
      samples.push({ y, t: now });
      while (samples.length > 2 && now - samples[0].t > 120) samples.shift();
      if (samples.length > 8) samples.shift();
    };

    const velocity = () => {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.t - first.t;
      return dt > 0 ? (last.y - first.y) / dt : 0;
    };

    const beginDrag = () => {
      mode = 'drag';
      onDragStartRef.current?.();
      contentEl.style.overflowY = 'hidden';
      sheetEl.style.transition = 'none';
      backdropEl.style.transition = 'none';
      document.body.style.userSelect = 'none';
    };

    const clearDragStyles = () => {
      contentEl.style.overflowY = '';
      document.body.style.userSelect = '';
    };

    const reset = () => {
      mode = 'idle';
      touchId = null;
      offset = 0;
      fromHandle = false;
      samples = [];
    };

    const snapBack = () => {
      sheetEl.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
      backdropEl.style.transition = 'background-color 320ms cubic-bezier(0.22, 1, 0.36, 1)';
      applyVisual(0);
    };

    const dismiss = (from: number, speed: number) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const distance = Math.max(window.innerHeight, sheetEl.getBoundingClientRect().bottom);
      // 화면이 넓을수록 이동 거리가 길어져 같은 속도라도 굼떠 보인다. 넓을수록 짧게 잡는다.
      // 480px 이하(모바일) 500~1000ms, 768px(태블릿) 416~826ms, 1440px 이상(데스크톱) 220~420ms
      const wide = Math.min(1, Math.max(0, (window.innerWidth - 480) / 960));
      const minDuration = 500 - wide * 280;
      const maxDuration = 1000 - wide * 580;
      const duration = Math.min(maxDuration, Math.max(minDuration, (distance - from) / Math.max(speed, 1.4)));
      sheetEl.style.transition = `transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
      backdropEl.style.transition = `background-color ${duration}ms linear`;
      sheetEl.style.transform = `translate3d(0, ${distance}px, 0)`;
      backdropEl.style.backgroundColor = 'rgba(0,0,0,0)';
      closeTimer = window.setTimeout(() => onCloseRef.current(), Math.max(0, duration - 20));
    };

    // 이동 거리뿐 아니라 남은 관성까지 반영해서 판단한다.
    const settle = () => {
      const dragged = mode === 'drag';
      const travelled = offset;
      const speed = velocity();
      clearDragStyles();
      reset();
      if (!dragged) return;

      const threshold = dismissDistance();
      const shouldDismiss =
        travelled >= threshold ||
        travelled + speed * PROJECTION_MS >= threshold ||
        (speed >= FLICK_VELOCITY && travelled >= 16);

      if (shouldDismiss) dismiss(travelled, speed);
      else snapBack();
    };

    const abort = () => {
      const dragged = mode === 'drag';
      clearDragStyles();
      reset();
      if (dragged) snapBack();
    };

    const canStartFrom = (target: Element | null) => {
      fromHandle = !!(handleEl && target && handleEl.contains(target));
      if (fromHandle) return true;
      return !target?.closest('button, a, input, textarea, select');
    };

    const shouldEngage = (dx: number, dy: number) => {
      if (dy <= 0 || dy < Math.abs(dx) * 0.8) return false;
      return fromHandle || contentEl.scrollTop <= 0;
    };

    const findTouch = (list: TouchList) => {
      for (let i = 0; i < list.length; i += 1) {
        if (list[i].identifier === touchId) return list[i];
      }
      return null;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (closingRef.current || mode !== 'idle' || e.touches.length > 1) return;
      if (!canStartFrom(e.target as Element | null)) return;
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      startX = touch.clientX;
      startY = touch.clientY;
      offset = 0;
      samples = [];
      track(touch.clientY);
      mode = 'detect';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (mode === 'idle') return;
      if (e.touches.length > 1) {
        abort();
        return;
      }
      const touch = findTouch(e.touches);
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (mode === 'detect') {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < DETECT_SLOP) return;
        if (!shouldEngage(dx, dy)) {
          reset();
          return;
        }
        beginDrag();
      }

      // 브라우저가 스크롤로 가져가면서 pointercancel을 쏘기 전에 제스처 소유권을 확보한다.
      if (e.cancelable) e.preventDefault();
      offset = Math.max(0, dy);
      track(touch.clientY);
      applyVisual(offset);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (mode === 'idle') return;
      if (!findTouch(e.changedTouches)) return;
      settle();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mode === 'idle') return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (mode === 'detect') {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < DETECT_SLOP) return;
        if (!shouldEngage(dx, dy)) {
          reset();
          return;
        }
        beginDrag();
      }

      e.preventDefault();
      offset = Math.max(0, dy);
      track(e.clientY);
      applyVisual(offset);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('mouseup', onMouseUp, true);
      settle();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (closingRef.current || mode !== 'idle' || e.button !== 0) return;
      if (!canStartFrom(e.target as Element | null)) return;
      startX = e.clientX;
      startY = e.clientY;
      offset = 0;
      samples = [];
      track(e.clientY);
      mode = 'detect';
      window.addEventListener('mousemove', onMouseMove, true);
      window.addEventListener('mouseup', onMouseUp, true);
    };

    sheetEl.addEventListener('touchstart', onTouchStart, { passive: true });
    sheetEl.addEventListener('touchmove', onTouchMove, { passive: false });
    sheetEl.addEventListener('touchend', onTouchEnd);
    sheetEl.addEventListener('touchcancel', onTouchEnd);
    sheetEl.addEventListener('mousedown', onMouseDown);

    return () => {
      sheetEl.removeEventListener('touchstart', onTouchStart);
      sheetEl.removeEventListener('touchmove', onTouchMove);
      sheetEl.removeEventListener('touchend', onTouchEnd);
      sheetEl.removeEventListener('touchcancel', onTouchEnd);
      sheetEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('mouseup', onMouseUp, true);
      clearDragStyles();
      if (closeTimer != null) window.clearTimeout(closeTimer);
    };
  }, [enabled, backdropOpacity, sheetRef, contentRef, backdropRef, handleRef]);

  return { closingRef, requestClose };
}
