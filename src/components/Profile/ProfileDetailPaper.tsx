"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { type PaperData } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';
import { ProfileDetailExpandToggle } from './ProfileDetailExpandToggle';
import { ProfileDetailListMarker } from './ProfileDetailListMarker';
import { ProfileDetailSectionLink } from './ProfileDetailSectionLink';

const SHOW_ITEM_NUMBERING = true;
const PAPER_PREVIEW_LIMIT = 10;
const PAPER_EXPAND_STEP = 10;

interface ProfileDetailPaperProps {
    papers: PaperData[];
    profileYamlId: string;
}

export function ProfileDetailPaper({ papers, profileYamlId }: ProfileDetailPaperProps) {
    const [displayedCount, setDisplayedCount] = useState(PAPER_PREVIEW_LIMIT);

    useEffect(() => {
        setDisplayedCount(PAPER_PREVIEW_LIMIT);
    }, [profileYamlId]);

    if (papers.length === 0) return null;

    const visiblePapers = papers.slice(0, displayedCount);
    const showMore = displayedCount < papers.length;
    const showLess = displayedCount > PAPER_PREVIEW_LIMIT;

    return (
        <>
            <div className="grid gap-x-4 gap-y-2">
                <ProfileDetailSectionLink href="/publications/papers" title="View papers">
                    Papers
                </ProfileDetailSectionLink>
                <div>
                    {visiblePapers.map((paper, index) => (
                        <div key={paper.title} className="mb-3 md:mb-4 leading-snug">
                            <div className="grid grid-cols-[auto,1fr] items-start">
                                <div className="flex items-start">
                                    <ProfileDetailListMarker index={index} showNumbering={SHOW_ITEM_NUMBERING} />
                                    <div className="flex-1">
                                        <div className="text-[15.5px] md:text-[16.5px] font-medium mb-1">
                                            <Link
                                                href={`/publications/papers#${encodeURIComponent(titleToId(paper.title))}`}
                                                className="hover:text-interactive-hover hover:underline underline-offset-4"
                                                title="View publication details"
                                            >
                                                {paper.title}
                                            </Link>
                                            {paper.status && (
                                                <span>
                                                    ,{' '}
                                                    <span
                                                        className={`inline-block text-[13px] px-2 py-1/2 rounded-full ${
                                                            paper.status === 'Accepted'
                                                                ? 'bg-brand-primary/10 text-brand-primary'
                                                                : paper.status === 'In Progress'
                                                                  ? 'bg-blue-500/10 text-blue-600'
                                                                  : paper.status === 'Under Review'
                                                                    ? 'bg-yellow-500/10 text-yellow-700'
                                                                    : 'bg-brand-primary/10 text-brand-primary'
                                                        }`}
                                                    >
                                                        {paper.status}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[13px] md:text-[14px] text-text-secondary">
                                            {paper.authors?.map((author, idx) => {
                                                const isFirstAuthor = author.position === 'first';
                                                const isCorresponding = author.isCorresponding;
                                                const hasMultipleFirstAuthors =
                                                    (paper.authors?.filter((a) => a.position === 'first').length ?? 0) > 1;

                                                return (
                                                    <span key={idx}>
                                                        <span
                                                            className={
                                                                author.ID === profileYamlId
                                                                    ? 'font-semibold text-black italic'
                                                                    : 'italic'
                                                            }
                                                        >
                                                            {author.name.replace(/\([^)]*\)/g, '').trim()}
                                                            {isCorresponding && '*'}
                                                            {isFirstAuthor && hasMultipleFirstAuthors && <sup> ‡</sup>}
                                                        </span>
                                                        {idx < (paper.authors?.length ?? 0) - 1 ? ', ' : ''}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        {(() => {
                                            const isAccepted = paper.status === 'Accepted';
                                            const showVenueYear = isAccepted && paper.venue && paper.year;
                                            const venueName = paper.venue?.acronym
                                                ? `${paper.venue.name} (${paper.venue.acronym})`
                                                : paper.venue?.name;

                                            return showVenueYear ? (
                                                <div className="text-[13px] md:text-[14px] text-text-secondary mt-1">
                                                    {venueName}, {paper.year}
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
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
                                    Math.min(count + PAPER_EXPAND_STEP, papers.length)
                                )
                            }
                            onShowLess={() => setDisplayedCount(PAPER_PREVIEW_LIMIT)}
                        />
                    )}
                </div>
            </div>
            <div className="my-2" />
        </>
    );
}
