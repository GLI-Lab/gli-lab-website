"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { type StudyData } from '@/data/loaders/types';
import { ProfileDetailExpandToggle } from './ProfileDetailExpandToggle';
import { ProfileDetailListMarker } from './ProfileDetailListMarker';
import { ProfileDetailSectionLink } from './ProfileDetailSectionLink';

const SHOW_ITEM_NUMBERING = false;
const STUDY_PREVIEW_LIMIT = 10;
const STUDY_EXPAND_STEP = 5;

interface ProfileDetailStudyProps {
    studies: StudyData[];
    profileYamlId: string;
}

function formatStudyDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function isOngoingStudy(endDate: string | null): boolean {
    if (!endDate) return true;
    const end = new Date(endDate);
    const now = new Date();
    return end > now;
}

export function ProfileDetailStudy({ studies, profileYamlId }: ProfileDetailStudyProps) {
    const [displayedCount, setDisplayedCount] = useState(STUDY_PREVIEW_LIMIT);

    useEffect(() => {
        setDisplayedCount(STUDY_PREVIEW_LIMIT);
    }, [profileYamlId]);

    if (studies.length === 0) return null;

    const visibleStudies = studies.slice(0, displayedCount);
    const showMore = displayedCount < studies.length;
    const showLess = displayedCount > STUDY_PREVIEW_LIMIT;

    return (
        <div className="grid gap-x-4 gap-y-1">
            <ProfileDetailSectionLink href="/board/study" title="Go to study page">
                Study
            </ProfileDetailSectionLink>
            <div>
                {visibleStudies.map((study, index) => (
                    <div key={study.title} className="mb-1.5 leading-snug">
                        <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-start">
                            <div className="flex items-start">
                                <ProfileDetailListMarker index={index} showNumbering={SHOW_ITEM_NUMBERING}/>
                                <Link
                                    href={`/board/study#study-${study.title.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="text-[14.5px] md:text-[15.5px] hover:text-interactive-hover hover:underline underline-offset-4"
                                    title="View in study page"
                                >
                                    {study.title}
                                </Link>
                            </div>
                            <div />
                            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                <span className="text-[13px] md:text-[14px] text-text-secondary">
                                    {formatStudyDate(study.start_date)}
                                    {study.end_date ? ` ~ ${formatStudyDate(study.end_date)}` : ' ~ '}
                                </span>
                                {isOngoingStudy(study.end_date) && (
                                    <span className="inline-block font-semibold bg-brand-primary/10 text-brand-primary text-[10px] px-1.5 py-0.5 rounded-md">
                                        NOW
                                    </span>
                                )}
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
                                Math.min(count + STUDY_EXPAND_STEP, studies.length)
                            )
                        }
                        onShowLess={() => setDisplayedCount(STUDY_PREVIEW_LIMIT)}
                    />
                )}
            </div>
        </div>
    );
}
