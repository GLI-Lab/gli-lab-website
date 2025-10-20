interface SectionHeaderProps {
  title: string;
  className?: string;
  underline?: boolean;
  size?: 'small' | 'large';
  children?: React.ReactNode;
  expandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function SectionHeader({ title, className, underline = true, size = 'large', children, expandable = false, isExpanded = false, onToggle }: SectionHeaderProps) {
  const sizeClasses = {
    small: 'text-[20px] md:text-[22px] lg:text-[24px] xl:text-[26px]',
    large: 'text-[24px] md:text-[26px] lg:text-[28px] xl:text-[30px]'
  };

  return (
    <div className="flex items-center justify-between">
      <div className={`text-gray-900 font-medium tracking-tight ${sizeClasses[size]}`}>
        <div className="flex items-start gap-1">
          {expandable && onToggle && (
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-[26px] h-[26px] md:w-7 md:h-7 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200 mt-0.5"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              <svg
                className={`w-[22px] h-[22px] md:w-6 md:h-6 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          <div>
            <p className={className}>
              {title}
            </p>
            {underline ? (
              <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>
            ) : (
              <div className="mt-1 mb-4"></div>
            )}
          </div>
        </div>
      </div>
      {children && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  );
}
