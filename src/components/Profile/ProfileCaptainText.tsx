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

export function ProfileCaptainText({
  captain,
  className = 'highlight',
}: ProfileCaptainTextProps) {
  if (!hasCaptain(captain)) return null;

  return (
    <span className="block min-w-0 text-left leading-snug">
      <span className={className}>{formatCaptainPeriod(captain!)}</span>
    </span>
  );
}
