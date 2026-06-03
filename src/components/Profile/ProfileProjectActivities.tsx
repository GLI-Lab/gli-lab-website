"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { type ProjectData } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';

interface ProfileProjectActivitiesProps {
    projects?: ProjectData[];
    profileId: string;
}

const formatMonth = (date?: string | null): string => {
    if (!date) return '';
    return date.replace(/-/g, '.');
};

export const ProfileProjectActivities: React.FC<ProfileProjectActivitiesProps> = ({ projects = [], profileId }) => {
    const [displayedCount, setDisplayedCount] = useState(5);

    // 현재 프로필이 실무책임자 또는 참여자로 포함된 프로젝트만 추출
    const myProjects = projects.filter(project =>
        project.managers.some(m => m.ID === profileId) ||
        project.participants.some(p => p.ID === profileId)
    );

    if (myProjects.length === 0) return null;

    return (
        <>
            <div className={`grid gap-x-4 gap-y-2 `}>
                <span className={`text-text-accent font-medium`}>
                    Activities (
                    <Link
                        href="/research/projects"
                        className="hover:text-interactive-hover hover:underline underline-offset-4"
                        title=""
                    >
                        Projects
                    </Link>
                    )
                </span>
                <div className="">
                    {myProjects.slice(0, displayedCount).map((project: ProjectData) => {
                        const manager = project.managers.find(m => m.ID === profileId);
                        const dateRange = `${formatMonth(project.start_date)} ~ ${formatMonth(project.end_date)}`;
                        const subtitle = [project.main.funder, project.main.program].filter(Boolean).join(' · ');

                        return (
                            <div key={project.title} className="mb-4 leading-snug">
                                <div className="grid grid-cols-[auto,1fr] items-start">
                                    <div className="flex items-start">
                                        <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
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
                    {myProjects.length > 5 && (
                        <div className="mb-2 leading-snug">
                            <div className="flex items-center gap-2">
                                <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[13.5px] md:text-[14.5px]">
                                        {Math.min(displayedCount, myProjects.length)} of {myProjects.length}
                                    </span>
                                    {displayedCount < myProjects.length && (
                                        <button
                                            onClick={() => setDisplayedCount(Math.min(displayedCount + 5, myProjects.length))}
                                            className="flex items-center gap-1 text-[13.5px] md:text-[14.5px] text-text-secondary hover:text-interactive-primary hover:underline cursor-pointer transition-colors"
                                        >
                                            <span>Show more</span>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                    {displayedCount > 5 && (
                                        <button
                                            onClick={() => setDisplayedCount(Math.max(5, displayedCount - 5))}
                                            className="flex items-center gap-1 text-[13.5px] md:text-[14.5px] text-text-secondary hover:text-interactive-primary hover:underline cursor-pointer transition-colors"
                                        >
                                            <span>Show less</span>
                                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="my-2"></div>
        </>
    );
};
