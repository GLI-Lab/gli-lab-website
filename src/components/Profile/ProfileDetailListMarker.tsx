"use client"

import React from 'react';

interface ProfileDetailListMarkerProps {
    index: number;
    showNumbering: boolean;
    className?: string;
}

const defaultClassName = 'text-brand-primary font-medium pr-1 pt-[1px] text-[14px] md:text-[15px] shrink-0';

export function ProfileDetailListMarker({
    index,
    showNumbering,
    className = defaultClassName,
}: ProfileDetailListMarkerProps) {
    return (
        <span className={className}>
            {showNumbering ? `[${index + 1}]` : '-'}
        </span>
    );
}
