import type { ProfileAffiliation } from '@/data/loaders/types';

export function hasAffiliation(affiliation?: ProfileAffiliation): boolean {
  return Boolean(affiliation?.current?.trim());
}

interface ProfileAffiliationTextProps {
  affiliation?: ProfileAffiliation;
  showVerified?: boolean;
  currentClassName?: string;
  verifiedClassName?: string;
}

export function ProfileAffiliationText({
  affiliation,
  showVerified = false,
  currentClassName,
  verifiedClassName = 'text-[15px] md:text-[16px] text-gray-500 font-normal no-underline',
}: ProfileAffiliationTextProps) {
  const current = affiliation?.current?.trim();
  if (!current) return null;

  const currentClasses = currentClassName?.includes('underline')
    ? `${currentClassName} underline-offset-2 pr-0.5`
    : currentClassName;

  return (
    <span className="block min-w-0 text-left leading-snug">
      <span className={currentClasses}>{current}</span>
      {showVerified && affiliation?.verified && (
        <span className={`${verifiedClassName} inline-block whitespace-nowrap ml-1`}>
          as of {affiliation.verified}
        </span>
      )}
    </span>
  );
}
