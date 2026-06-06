"use client"

import React from 'react';

interface ProfileDetailExpandToggleProps {
    onShowMore: () => void;
    onShowLess: () => void;
    showMore: boolean;
    showLess: boolean;
}

const buttonClassName =
    'flex items-center gap-1 text-[13.5px] md:text-[14.5px] text-text-secondary hover:text-interactive-primary hover:underline cursor-pointer transition-colors';

export function ProfileDetailExpandToggle({
    onShowMore,
    onShowLess,
    showMore,
    showLess,
}: ProfileDetailExpandToggleProps) {
    if (!showMore && !showLess) return null;

    return (
        <div className="mb-2 leading-snug">
            <div className="flex items-center gap-2">
                <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                <div className="flex items-center gap-3">
                    {showMore && (
                        <button type="button" onClick={onShowMore} className={buttonClassName}>
                            <span>Show more</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                    {showLess && (
                        <button type="button" onClick={onShowLess} className={buttonClassName}>
                            <span>Show less</span>
                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
