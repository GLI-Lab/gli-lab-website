"use client"

import React, { useState, useEffect } from 'react';
import { type PatentData, type ProfileLinks } from '@/data/loaders/types';
import { PublicationHoverLink } from '@/components/Publication/PublicationHoverLink';
import { patentToPreview } from '@/components/Publication/publicationPreview';
import { ProfileAuthorName } from './ProfileHoverLink';
import { ProfileDetailExpandToggle } from './ProfileDetailExpandToggle';
import { ProfileDetailListMarker } from './ProfileDetailListMarker';
import { ProfileDetailSectionLink } from './ProfileDetailSectionLink';

const SHOW_ITEM_NUMBERING = true;
const PATENT_PREVIEW_LIMIT = 10;
const PATENT_EXPAND_STEP = 5;

interface ProfileDetailPatentProps {
    patents: PatentData[];
    profileYamlId: string;
    profileLinks?: ProfileLinks;
}

function formatPatentDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
}

export function ProfileDetailPatent({ patents, profileYamlId, profileLinks }: ProfileDetailPatentProps) {
    const [displayedCount, setDisplayedCount] = useState(PATENT_PREVIEW_LIMIT);

    useEffect(() => {
        setDisplayedCount(PATENT_PREVIEW_LIMIT);
    }, [profileYamlId]);

    if (patents.length === 0) return null;

    const visiblePatents = patents.slice(0, displayedCount);
    const showMore = displayedCount < patents.length;
    const showLess = displayedCount > PATENT_PREVIEW_LIMIT;

    return (
        <>
            <div className="grid gap-x-4 gap-y-2">
                <ProfileDetailSectionLink href="/publications/patents" title="View patents">
                    Patents
                </ProfileDetailSectionLink>
                <div>
                    {visiblePatents.map((patent, index) => {
                        const filed = patent.status.filed;
                        const registered = patent.status.registered;
                        const patentTitleKey = `${patent.title.ko}\n${patent.title.en}`;

                        return (
                            <div key={patentTitleKey} className="mb-3 md:mb-4 leading-snug">
                                <div className="grid grid-cols-[auto,1fr] items-start">
                                    <div className="flex items-start">
                                        <ProfileDetailListMarker index={index} showNumbering={SHOW_ITEM_NUMBERING} />
                                        <div className="flex-1">
                                            <div className="text-[15.5px] md:text-[16.5px] font-medium mb-1">
                                                <PublicationHoverLink
                                                    preview={patentToPreview(patent)}
                                                    className="hover:text-interactive-hover hover:underline underline-offset-4"
                                                >
                                                    {patent.title.ko}
                                                    <br />
                                                    <span className="text-[14px] md:text-[15px] font-normal text-gray-600">
                                                        {patent.title.en}
                                                    </span>
                                                </PublicationHoverLink>
                                            </div>
                                            <div className="text-[13px] md:text-[14px] text-text-secondary">
                                                {patent.authors?.map((author, idx) => (
                                                    <span key={idx}>
                                                        <ProfileAuthorName
                                                            authorId={author.ID}
                                                            name={author.name}
                                                            profileLinks={profileLinks}
                                                            className={
                                                                author.ID === profileYamlId
                                                                    ? 'font-semibold text-black italic'
                                                                    : 'italic'
                                                            }
                                                        />
                                                        {idx < patent.authors.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-[13px] md:text-[14px] text-text-secondary mt-1">
                                                {filed.date && filed.number && (
                                                    <span>
                                                        출원번호 {filed.number}, 출원일 {formatPatentDate(filed.date)}
                                                    </span>
                                                )}
                                                {registered.date && registered.number && (
                                                    <span>
                                                        {filed.date && filed.number && ', '}
                                                        등록번호 {registered.number}, 등록일{' '}
                                                        {formatPatentDate(registered.date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {(showMore || showLess) && (
                        <ProfileDetailExpandToggle
                            showMore={showMore}
                            showLess={showLess}
                            onShowMore={() =>
                                setDisplayedCount((count) =>
                                    Math.min(count + PATENT_EXPAND_STEP, patents.length)
                                )
                            }
                            onShowLess={() => setDisplayedCount(PATENT_PREVIEW_LIMIT)}
                        />
                    )}
                </div>
            </div>
            <div className="my-2" />
        </>
    );
}
