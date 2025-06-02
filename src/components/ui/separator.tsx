"use client"

interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  return (
    <div 
      className={[
        "shrink-0 bg-neutral-200 dark:bg-neutral-800 h-[1px] w-full",
        className
      ].filter(Boolean).join(" ")}
    />
  );
}
