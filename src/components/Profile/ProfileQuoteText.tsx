interface ProfileQuoteTextProps {
  quote?: string;
  reflection?: string;
  isAlumniPage?: boolean;
  align?: 'center' | 'left';
  className?: string;
}

export function getProfileQuoteText(
  quote?: string,
  reflection?: string,
  isAlumniPage?: boolean,
): string | null {
  const text = (isAlumniPage ? reflection : quote)?.trim() ?? '';
  return text || null;
}

export function hasProfileQuote(
  quote?: string,
  reflection?: string,
  isAlumniPage?: boolean,
): boolean {
  return getProfileQuoteText(quote, reflection, isAlumniPage) !== null;
}

export function ProfileQuoteText({
  quote,
  reflection,
  isAlumniPage = false,
  align = 'center',
  className = '',
}: ProfileQuoteTextProps) {
  const text = getProfileQuoteText(quote, reflection, isAlumniPage);
  if (!text) return null;

  return (
    <div className={`mx-4 ${align === 'left' ? 'text-left' : 'text-center'} ${className}`.trim()}>
      <p className="text-[15.5px] md:text-[16.5px] italic text-gray-600 leading-snug">
        <span className="text-[19px] md:text-[20px] leading-none">&ldquo;</span>
        {text}
        <span className="text-[19px] md:text-[20px] leading-none">&rdquo;</span>
      </p>
    </div>
  );
}
