"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { type SeminarData } from '@/data/loaders/types';
import { getSeminarHashId } from '@/lib/utils';
import { ProfileDetailExpandToggle } from './ProfileDetailExpandToggle';
import { ProfileDetailListMarker } from './ProfileDetailListMarker';
import { ProfileDetailSectionLink } from './ProfileDetailSectionLink';

const SHOW_ITEM_NUMBERING = false;
const SEMINAR_PREVIEW_LIMIT = 10;
const SEMINAR_EXPAND_STEP = 5;

interface ProfileDetailSeminarProps {
    seminars: SeminarData[];
    profileYamlId: string;
}

function formatSeminarDate(dateValue: string | Date): string {
    const raw = typeof dateValue === 'string'
        ? dateValue.replace(/\s*\([^)]*\)\s*$/, '').trim()
        : dateValue;
    const date = new Date(raw as string);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
}

export function ProfileDetailSeminar({ seminars, profileYamlId }: ProfileDetailSeminarProps) {
    const [displayedCount, setDisplayedCount] = useState(SEMINAR_PREVIEW_LIMIT);

    useEffect(() => {
        setDisplayedCount(SEMINAR_PREVIEW_LIMIT);
    }, [profileYamlId]);

    if (seminars.length === 0) return null;

    const visibleSeminars = seminars.slice(0, displayedCount);
    const showMore = displayedCount < seminars.length;
    const showLess = displayedCount > SEMINAR_PREVIEW_LIMIT;

    return (
        <>
            <div className="grid gap-x-4 gap-y-1">
                <ProfileDetailSectionLink href="/board/seminar" title="Go to seminar page">
                    Seminar
                </ProfileDetailSectionLink>
                <div>
                    {visibleSeminars.map((seminar, index) => (
                        <div key={`${seminar.date}-${seminar.title}`} className="mb-1.5 leading-snug">
                            <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-start">
                                <div className="flex items-start">
                                    <ProfileDetailListMarker index={index} showNumbering={SHOW_ITEM_NUMBERING} />
                                    <Link
                                        href={`/board/seminar#${encodeURIComponent(getSeminarHashId(seminar.title))}`}
                                        className="text-[14.5px] md:text-[15.5px] hover:text-interactive-hover hover:underline underline-offset-4"
                                        title="View in seminar page"
                                    >
                                        {seminar.title}
                                    </Link>
                                </div>
                                <div />
                                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                    <span className="text-[13px] md:text-[14px] text-text-secondary">
                                        {formatSeminarDate(seminar.date)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(showMore || showLess) && (
                        <ProfileDetailExpandToggle
                            showMore={showMore}
                            showLess={showLess}
                            onShowMore={() =>
                                setDisplayedCount((count) =>
                                    Math.min(count + SEMINAR_EXPAND_STEP, seminars.length),
                                )
                            }
                            onShowLess={() => setDisplayedCount(SEMINAR_PREVIEW_LIMIT)}
                        />
                    )}
                </div>
            </div>
            <div className="my-4" />
        </>
    );
}
