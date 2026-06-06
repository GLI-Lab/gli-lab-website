"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { type ProjectData } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';
import { ProfileDetailExpandToggle } from './ProfileDetailExpandToggle';
import { ProfileDetailListMarker } from './ProfileDetailListMarker';
import { ProfileDetailSectionLink } from './ProfileDetailSectionLink';

const SHOW_ITEM_NUMBERING = false;
const PROJECT_PREVIEW_LIMIT = 10;
const PROJECT_EXPAND_STEP = 5;

interface ProfileDetailProjectProps {
    projects?: ProjectData[];
    profileId: string;
}

function formatMonth(date?: string | null): string {
    if (!date) return '';
    return date.replace(/-/g, '.');
}

export function ProfileDetailProject({ projects = [], profileId }: ProfileDetailProjectProps) {
    const [displayedCount, setDisplayedCount] = useState(PROJECT_PREVIEW_LIMIT);

    useEffect(() => {
        setDisplayedCount(PROJECT_PREVIEW_LIMIT);
    }, [profileId]);

    const myProjects = projects.filter(
        (project) =>
            project.managers.some((m) => m.ID === profileId) ||
            project.participants.some((p) => p.ID === profileId)
    );

    if (myProjects.length === 0) return null;

    const visibleProjects = myProjects.slice(0, displayedCount);
    const showMore = displayedCount < myProjects.length;
    const showLess = displayedCount > PROJECT_PREVIEW_LIMIT;

    return (
        <>
            <div className="grid gap-x-4 gap-y-2">
                <ProfileDetailSectionLink href="/research/projects" title="View projects">
                    Projects
                </ProfileDetailSectionLink>
                <div>
                    {visibleProjects.map((project, index) => {
                        const manager = project.managers.find((m) => m.ID === profileId);
                        const dateRange = `${formatMonth(project.start_date)} ~ ${formatMonth(project.end_date)}`;
                        const subtitle = [project.main.funder, project.main.program].filter(Boolean).join(' · ');

                        return (
                            <div key={project.title} className="mb-4 leading-snug">
                                <div className="grid grid-cols-[auto,1fr] items-start">
                                    <div className="flex items-start">
                                        <ProfileDetailListMarker index={index} showNumbering={SHOW_ITEM_NUMBERING} />
                                        <div className="flex-1">
                                            <div className="text-[15.5px] md:text-[16.5px] font-medium mb-1">
                                                <Link
                                                    href={`/research/projects#${encodeURIComponent(titleToId(project.title))}`}
                                                    className="hover:text-interactive-hover hover:underline underline-offset-4"
                                                    title="View project details"
                                                >
                                                    {project.title}
                                                </Link>
                                                {manager && (
                                                    <span>
                                                        {' '}
                                                        <span className="inline-block align-middle text-[13px] px-2 py-1/2 rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                                                            실무책임자{manager.until ? ' (이전)' : ''}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            {subtitle && (
                                                <div className="text-[13px] md:text-[14px] text-text-secondary">
                                                    {subtitle}
                                                </div>
                                            )}
                                            <div className="text-[13px] md:text-[14px] text-text-secondary mt-1">
                                                {project.type} · {dateRange}
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
                                    Math.min(count + PROJECT_EXPAND_STEP, myProjects.length)
                                )
                            }
                            onShowLess={() => setDisplayedCount(PROJECT_PREVIEW_LIMIT)}
                        />
                    )}
                </div>
            </div>
            <div className="my-2" />
        </>
    );
}
