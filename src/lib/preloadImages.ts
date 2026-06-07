import { getImageProps } from 'next/image';

import type { ProfileData } from '@/data/loaders/types';

/** ProfileCardDetail 모달 Image sizes와 동일 */
export const PROFILE_MODAL_IMAGE_SIZES = '(max-width: 880px) 560px, 640px';

/** GalleryModal ImageCarousel sizes와 동일 */
export const GALLERY_MODAL_IMAGE_SIZES = '100vw';

/**
 * Next/Image가 srcSet에서 고르는 URL과 동일한 후보를 선택.
 * getImageProps().src 는 w=3840 fallback이라 그대로 preload하면 모달 Image와 다른 URL을 받아 이중 fetch 발생.
 */
function pickSrcSetUrl(srcSet: string | undefined, requiredWidth: number, fallbackSrc: string): string {
    if (!srcSet) return fallbackSrc;

    const candidates = srcSet.split(', ').map((entry) => {
        const [url, descriptor] = entry.split(' ');
        const w = Number.parseInt(descriptor, 10);
        return { url, w };
    });

    const match =
        candidates.find((c) => c.w >= requiredWidth) ??
        candidates[candidates.length - 1];

    return match?.url ?? fallbackSrc;
}

function getProfileModalOptimizedUrl(src: string): string {
    const { props } = getImageProps({
        src,
        sizes: PROFILE_MODAL_IMAGE_SIZES,
        fill: true,
        alt: '',
    });
    const viewportWidth = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    const slotWidth = viewportWidth <= 880 ? 560 : 640;
    const requiredWidth = Math.ceil(slotWidth * dpr);
    return pickSrcSetUrl(props.srcSet, requiredWidth, props.src);
}

function getGalleryModalOptimizedUrl(src: string): string {
    const { props } = getImageProps({
        src,
        sizes: GALLERY_MODAL_IMAGE_SIZES,
        fill: true,
        alt: '',
    });
    const requiredWidth = Math.ceil(window.innerWidth * (window.devicePixelRatio || 1));
    return pickSrcSetUrl(props.srcSet, requiredWidth, props.src);
}

function preloadUrl(url: string): Promise<void> {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
    });
}

/** 단일 프로필 사진을 모달용 optimized URL로 preload */
export function preloadModalImage(src: string): Promise<void> {
    if (!src) return Promise.resolve();
    return preloadUrl(getProfileModalOptimizedUrl(src));
}

export function preloadGalleryModalImage(src: string): Promise<void> {
    if (!src) return Promise.resolve();
    return preloadUrl(getGalleryModalOptimizedUrl(src));
}

/** 모달용 갤러리 이미지 preload — 현재 인덱스 완료까지 대기, 나머지는 백그라운드 */
export function preloadGalleryModalImages(images: string[], startIndex = 0): Promise<void> {
    const list = images.filter(Boolean);
    if (list.length === 0) return Promise.resolve();

    const index = Math.min(Math.max(0, startIndex), list.length - 1);
    list.forEach((src, i) => {
        if (i !== index) void preloadGalleryModalImage(src);
    });

    return preloadGalleryModalImage(list[index]);
}

/** 모달용 프로필 사진 preload — photo[0] 완료까지 대기, 나머지는 백그라운드 */
export function preloadProfileModalPhoto(profile: ProfileData): Promise<void> {
    const photos = profile.photo.filter(Boolean);
    if (photos.length === 0) return Promise.resolve();

    photos.slice(1).forEach((src) => {
        preloadModalImage(src);
    });

    return preloadModalImage(photos[0]);
}

/** 진행 중인 smooth scroll을 현재 위치에서 즉시 멈춤 */
export function stopSmoothScroll(): void {
    window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: 'instant' });
}
