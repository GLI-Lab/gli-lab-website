interface SectionHeaderProps {
  title: string;
  className?: string;
  underline?: boolean;
  size?: 'small' | 'large';
  children?: React.ReactNode;
}

export default function SectionHeader({ title, className, underline = true, size = 'large', children }: SectionHeaderProps) {
  const sizeClasses = {
    small: 'text-[20px] md:text-[22px] lg:text-[24px] xl:text-[26px]',
    large: 'text-[24px] md:text-[26px] lg:text-[28px] xl:text-[30px]'
  };

  return (
    <div className="flex items-center justify-between">
      <div className={`text-gray-900 font-medium tracking-tight ${sizeClasses[size]}`}>
        <p className={className}>
          {title}
        </p>
        {underline ? (
          <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>
        ) : (
          <div className="mt-1 mb-4"></div>
        )}
      </div>
      {children && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  );
}
