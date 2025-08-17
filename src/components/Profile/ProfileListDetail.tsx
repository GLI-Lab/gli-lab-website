"use client"

import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator"
import { findUserRoleInPaper } from '@/data/loaders/utils';
import { ProfileDetailProps, type StudyData, type PaperData } from '@/data/loaders/types';
import Link from 'next/link';

export const ProfileListDetail: React.FC<ProfileDetailProps> = (props) => {
    const {id, title, name_en, name_ko, admission, joined_start, joined_end, bs, ms, phd, email, interest, homepage, github, linkedin, graduation, affiliation, studies = [], papers = [], isAlumniPage = false } = props;
    const [displayedStudiesCount, setDisplayedStudiesCount] = useState(5);

    // 현재 프로필과 관련된 스터디를 필터링하는 함수
    const filterStudiesForProfile = (allStudies: any[], profile: any) => {
        return allStudies.filter(study => 
            study.participants.some((participant: string) => {
                // <profile=[date] name>Full Name</> 형식 파싱
                const profileMatch = participant.match(/^<profile=(.+?)>(.+?)<\/>$/);
                if (profileMatch) {
                    const [, profileId, ] = profileMatch;
                    return profileId === profile.id;
                }
                return false;
            })
        );
    };

    // 현재 프로필과 관련된 논문을 필터링하는 함수
    const getPapersForProfile = (allPapers: any[], profileId: string) => {
        return allPapers.filter(paper => 
            paper.authors.some((author: any) => author.profileId === profileId)
        );
    };

    // 현재 프로필과 관련된 스터디와 논문 필터링
    const filteredStudies = filterStudiesForProfile(studies, { id });
    const filteredPapers = getPapersForProfile(papers, id);

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const isOngoingStudy = (endDate: string | null): boolean => {
        if (!endDate) return true;
        const end = new Date(endDate);
        const now = new Date();
        return end > now;
    };

    return (
        <div className="flex flex-col">
            <div className="w-full text-[16px] md:text-[17px]">
                <div className="mb-6">
                    <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 mb-1`}>
                        <span className={`text-brand-primary highlight text-[18px] md:text-[19px] whitespace-nowrap`}>{title}</span>
                    </div>
                    <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 mb-1`}>
                        <span className={`text-brand-primary highlight-2 text-[18px] md:text-[19px]`}>{affiliation}</span>
                    </div>
                    <div className="my-3"></div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-[auto,1fr] gap-x-4 items-center">
                    {graduation && (
                        <><span className={`text-text-accent font-medium`}>Graduation</span><span className="text-[15.5px] md:text-[16.5px]">{graduation}</span></>
                    )}
                    {admission && (
                        <><span className={`text-text-accent font-medium`}>Admission</span><span className="text-[15.5px] md:text-[16.5px]">{admission}</span></>
                    )}
                    {joined_start && joined_end && (
                        <><span className={`text-text-accent font-medium`}>Joined</span><span className="text-[15.5px] md:text-[16.5px]">{joined_start} - {joined_end}</span></>
                    )}
                </div>
                
                <Separator className="my-3"/>

                {/* Education */}
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 items-start`}>
                    {bs && <><span className={`text-text-accent font-medium`}>B.S.</span><span className="text-[15.5px] md:text-[16.5px]">{bs}</span></>}
                    {ms && <><span className={`text-text-accent font-medium`}>M.S.</span><span className="text-[15.5px] md:text-[16.5px]">{ms}</span></>}
                    {phd && <><span className={`text-text-accent font-medium`}>Ph.D.</span><span className="text-[15.5px] md:text-[16.5px]">{phd}</span></>}
                </div>
                <Separator className="my-3"/>

                {/* Contact */}
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-start`}>
                    <span className={`text-text-accent font-medium`}>Email</span>
                    <div className="flex flex-col">
                        {email.length > 0 && email.some(e => e.trim() !== '') ? (
                            email.filter(e => e.trim() !== '').map((src, index) => (
                                <a href={`mailto:${src}`} key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">{src}</a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>Home</span>
                    <div className="flex flex-col">
                        {homepage.length > 0 && homepage.some(h => h.trim() !== '') ? (
                            homepage.filter(h => h.trim() !== '').map((src, index) => (
                                <a href={src} target="_blank" rel="" title={src} key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://", "").split('/')[0]}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>Github</span>
                    <div className="flex flex-col">
                        {github.length > 0 && github.some(g => g.trim() !== '') ? (
                            github.filter(g => g.trim() !== '').map((src, index) => (
                                <a href={src} rel="" title={src} key={index} target="_blank"
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 break-all text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://github.com/", "")}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>LinkedIn</span>
                    <div className="flex flex-col">
                        {linkedin.length > 0 && linkedin.some(l => l.trim() !== '') ? (
                            linkedin.filter(l => l.trim() !== '').map((src, index) => (
                                <a href={src} rel="" title={src} target="_blank" key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://www.linkedin.com/in/", "")}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">{linkedin}</span>
                        )}
                    </div>
                </div>
                <Separator className="my-3"/>

                {/* Activities (Publication) */}
                {filteredPapers.length > 0 && (
                    <div className={`grid gap-x-4 gap-y-2 `}>
                        <span className={`text-text-accent font-medium`}>
                            Activities (
                            <Link 
                                href="https://bkoh509.github.io" 
                                className="hover:text-interactive-hover hover:underline underline-offset-4"
                                title=""
                            >
                                Publication
                            </Link>
                            )
                        </span>
                        <div className="">
                            {filteredPapers.slice(0, 5).map((paper: PaperData, index: number) => {
                                // Find current user's role in this paper using explicit role information
                                const userRole = findUserRoleInPaper(paper.authors, id);

                                return (
                                    <div key={paper.title} className="mb-4 leading-snug">
                                        <div className="grid grid-cols-[auto,1fr] gap-x-4 items-start">
                                            <div className="flex items-start">
                                                <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                                                <div className="flex-1">
                                                    <div className="text-[15.5px] md:text-[16.5px] font-medium mb-1">
                                                        <Link 
                                                            href="https://bkoh509.github.io" 
                                                            className="hover:text-interactive-hover hover:underline underline-offset-4"
                                                            title="View publication details"
                                                        >
                                                            {paper.title}
                                                        </Link>
                                                        {(() => {
                                                            // year만 있는 경우
                                                            if (paper.year && !paper.venue) {
                                                                return (
                                                                    <span className="text-[15px] md:text-[16px] text-text-secondary font-normal">
                                                                        , {paper.year}
                                                                        {paper.status && (
                                                                            <span>
                                                                                , <span className="inline-block bg-brand-primary/10 text-brand-primary text-xs px-2 py-1/2 rounded-full">
                                                                                    {paper.status}
                                                                                </span>
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                );
                                                            }
                                                            // year와 venue가 모두 있는 경우
                                                            else if (paper.year && paper.venue) {
                                                                return (
                                                                    <span className="text-[15px] md:text-[16px] text-text-secondary font-normal">
                                                                        , {paper.venue}, {paper.year}
                                                                        {paper.status && (
                                                                            <span>
                                                                                , <span className="inline-block bg-brand-primary/10 text-brand-primary text-xs px-2 py-1/2 rounded-full">
                                                                                    {paper.status}
                                                                                </span>
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                );
                                                            }
                                                            // year와 venue가 모두 없는 경우
                                                            else if (paper.status) {
                                                                return (
                                                                    <span className="text-[15px] md:text-[16px] text-text-secondary font-normal">
                                                                        , <span className="inline-block bg-brand-primary/10 text-brand-primary text-xs px-2 py-1/2 rounded-full">
                                                                            {paper.status}
                                                                        </span>
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                    <div className="text-[12.5px] md:text-[13.5px] text-text-secondary">
                                                        {(() => {
                                                            // 제1저자들을 그룹화
                                                            const firstAuthors = paper.authors?.filter(author => author.role === '1저자') || [];
                                                            const otherAuthors = paper.authors?.filter(author => author.role !== '1저자') || [];
                                                            
                                                            return (
                                                                <>
                                                                    {/* 제1저자들 */}
                                                                    {firstAuthors.length > 0 && (
                                                                        <>
                                                                            {firstAuthors.length === 1 ? (
                                                                                <span className={firstAuthors[0].profileId === id ? 'font-semibold text-black italic' : 'italic'}>
                                                                                    {firstAuthors[0].displayName.replace(/\([^)]*\)/g, '').trim()}
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    {'{'}
                                                                                    {firstAuthors.map((author, idx) => (
                                                                                        <span key={idx}>
                                                                                            <span className={author.profileId === id ? 'font-semibold text-black italic' : 'italic'}>
                                                                                                {author.displayName.replace(/\([^)]*\)/g, '').trim()}
                                                                                            </span>
                                                                                            {idx < firstAuthors.length - 1 ? ', ' : ''}
                                                                                        </span>
                                                                                    ))}
                                                                                    {'}'}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    
                                                                    {/* 다른 저자들 */}
                                                                    {otherAuthors.length > 0 && (
                                                                        <>
                                                                            {firstAuthors.length > 0 && ', '}
                                                                            {otherAuthors.map((author, idx) => (
                                                                                <span key={idx}>
                                                                                    <span className={author.profileId === id ? 'font-semibold text-black italic' : 'italic'}>
                                                                                        {author.displayName.replace(/\([^)]*\)/g, '').trim()}
                                                                                    </span>
                                                                                    {idx < otherAuthors.length - 1 ? ', ' : ''}
                                                                                </span>
                                                                            ))}
                                                                        </>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredPapers.length > 5 && (
                                <div className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-center">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                                            <span className="text-[13px] md:text-[14px] text-text-secondary">
                                                ... (+{filteredPapers.length - 5} more)
                                            </span>
                                        </div>
                                        <div className="text-[12.5px] text-text-accent italic whitespace-nowrap">
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="my-2"></div>
                
                {/* Activities (Study) */}
                {filteredStudies.length > 0 && (
                    <div className={`grid gap-x-4 gap-y-1`}>
                        <span className={`text-text-accent font-medium`}>
                            Activities (
                            <Link 
                                href="/board/study" 
                                className="hover:text-interactive-hover hover:underline underline-offset-4"
                                title="Go to study page"
                            >
                                Study
                            </Link>
                            )
                        </span>
                        <div className="">
                            {filteredStudies.slice(0, displayedStudiesCount).map((study: StudyData, index: number) => (
                                <div key={study.title} className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-start">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[15px] md:text-[16px]">-</span>
                                            <Link 
                                                href={`/board/study#study-${study.title.replace(/\s+/g, '-').toLowerCase()}`}
                                                className="text-[14.5px] md:text-[15.5px] hover:text-interactive-hover hover:underline underline-offset-4"
                                                title="View in study page"
                                            >
                                                {study.title}
                                            </Link>
                                        </div>
                                        <div></div>
                                        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                            <span className="text-[12.5px] text-text-accent">
                                                {formatDate(study.start_date)}
                                                {study.end_date ? ` ~ ${formatDate(study.end_date)}` : ' ~ '}
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
                            {filteredStudies.length > displayedStudiesCount && (
                                <div className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-center">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[16px]">-</span>
                                            <button 
                                                onClick={() => setDisplayedStudiesCount(prev => Math.min(prev + 5, filteredStudies.length))}
                                                className="text-[13.5px] md:text-[14.5px] text-text-secondary hover:text-interactive-primary hover:underline cursor-pointer"
                                            >
                                                See more ({displayedStudiesCount} / {filteredStudies.length})
                                            </button>
                                        </div>
                                        <div></div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
