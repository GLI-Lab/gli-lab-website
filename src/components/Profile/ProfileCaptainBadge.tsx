import type { ProfileCaptain } from '@/data/loaders/types';

export function isActiveCaptain(captain?: ProfileCaptain): boolean {
  return Boolean(captain?.start && captain.end.toLowerCase() === 'current');
}

interface ProfileCaptainBadgeProps {
  captain: ProfileCaptain;
  /** card: 115→140→150px 사진, detail: 280→320px 사진, list: 280→250px 사진 */
  size?: 'card' | 'detail' | 'list';
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l2.9 6.26 6.83.62-5.15 4.48 1.55 6.7L12 17.77l-6.13 3.29 1.55-6.7-5.15-4.48 6.83-.62L12 2z" />
    </svg>
  );
}

// const SIZE_PRESETS = {
//   // ProfileCardItem photo: w-[115px] sm:w-[140px] lg:w-[150px]
//   card: {
//     badge: 'top-1 left-1 w-[20px] h-[20px] sm:top-1.5 sm:left-1.5 sm:w-[22px] sm:h-[22px] lg:top-1.5 lg:left-1.5 lg:w-[24px] lg:h-[24px]',
//     icon: 'w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] lg:w-[22px] lg:h-[22px]',
//   },
//   // ProfileCardDetail photo: w-[280px] 1.5md:w-[320px]
//   detail: {
//     badge: 'top-3 left-3 w-[32px] h-[32px] 1.5md:top-3 1.5md:left-3 1.5md:w-[32px] 1.5md:h-[32px]',
//     icon: 'w-[28px] h-[28px] 1.5md:w-[28px] 1.5md:h-[28px]',
//   },
//   // ProfileListItem photo: w-[280px] md:w-[250px]
//   list: {
//     badge: 'top-2 left-2 w-9 h-9 md:top-2 md:left-2 md:w-8 md:h-8',
//     icon: 'w-7 h-7 md:w-6 md:h-6',
//   },
// } as const;

const SIZE_PRESETS = {
  // ProfileCardItem photo: w-[115px] sm:w-[140px] lg:w-[150px]
  card: {
    badge: 'top-1 left-1 w-[20px] h-[20px] sm:top-1.5 sm:left-1.5 sm:w-[22px] sm:h-[22px] lg:top-1.5 lg:left-1.5 lg:w-[24px] lg:h-[24px]',
    icon: 'w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] lg:w-[26px] lg:h-[26px]',
  },
  // ProfileCardDetail photo: w-[280px] 1.5md:w-[320px]
  detail: {
    badge: 'top-3 left-3 w-[32px] h-[32px] 1.5md:top-3 1.5md:left-3 1.5md:w-[36px] 1.5md:h-[36px]',
    icon: 'w-[32px] h-[32px] 1.5md:w-[36px] 1.5md:h-[36px]',
  },
  // ProfileListItem photo: w-[280px] md:w-[250px]
  list: {
    badge: 'top-3 left-3 w-[32px] h-[32px] 1.5md:top-3 1.5md:left-3 1.5md:w-[32px] 1.5md:h-[32px]',
    icon: 'w-[32px] h-[32px] 1.5md:w-[32px] 1.5md:h-[32px]',
  },
} as const;

export function ProfileCaptainBadge({ captain, size = 'list' }: ProfileCaptainBadgeProps) {
  if (!isActiveCaptain(captain)) return null;

  const preset = SIZE_PRESETS[size];

  return (
    // bg-brand-primary
    <span
      className={`absolute ${preset.badge} z-10 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-white/90`}
      title={`Captain (${captain.start} - ${captain.end})`}
      aria-label={`Captain (${captain.start} - ${captain.end})`}
    >
      <StarIcon className={`${preset.icon} text-amber-500`} />
    </span>
  );
}
