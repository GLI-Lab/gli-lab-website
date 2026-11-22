import type { ProfileCaptain } from '@/data/loaders/types';

export function hasCaptain(captain?: ProfileCaptain): boolean {
  return Boolean(captain?.start?.trim() && captain?.end?.trim());
}

export function formatCaptainPeriod(captain: ProfileCaptain): string {
  return `${captain.start} - ${captain.end}`;
}

interface ProfileCaptainTextProps {
  captain?: ProfileCaptain;
  className?: string;
}

/**
 * 캡틴 기간의 형광펜. 모양(굵은 글자, 좌우 여백)은 사이트의 .highlight 그대로이고,
 * 색만 직위의 형광펜 밑줄(TITLE_MARKER)과 같은 반투명 노란색(amber-500 40%)으로 바꾼다.
 */
const CAPTAIN_HIGHLIGHT = 'highlight bg-amber-500/40';

export function ProfileCaptainText({
  captain,
  className = CAPTAIN_HIGHLIGHT,
}: ProfileCaptainTextProps) {
  if (!hasCaptain(captain)) return null;

  return (
    <span className="block min-w-0 text-left leading-snug">
      <span className={className}>{formatCaptainPeriod(captain!)}</span>
    </span>
  );
}
