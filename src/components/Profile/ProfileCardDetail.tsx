"use client"

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'
import { Separator } from "@/components/ui/separator"
import { findUserRoleInPaper } from '@/data/loaders/utils';
import { ProfileDetailProps, type StudyData, type PaperData } from '@/data/loaders/types';
import Link from 'next/link';

export const ProfileCardDetail: React.FC<ProfileDetailProps> = (props) => {
    const {id, title, name_en, name_ko, admission, joined_start, joined_end, bs, ms, phd, photo, email, interest, homepage, github, linkedin, graduation, affiliation, studies = [], papers = [], isAlumniPage = false } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30}, [Fade()]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [displayedStudiesCount, setDisplayedStudiesCount] = useState(5);
    const [displayedPapersCount, setDisplayedPapersCount] = useState(5);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect(); // 초기 선택된 슬라이드 설정
    }, [emblaApi, onSelect]);

    useEffect(() => {
        setSelectedIndex(0);
        emblaApi?.scrollTo(0); // embla를 초기화하여 첫 번째 슬라이드로 이동
    }, [photo]); // photo 배열이 변경될 때마다 실행

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
        <div className=" bg-white flex flex-col items-center justify-center">
            <div className="embla">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex w-[280px] h-[330px] 1.5md:w-[320px] 1.5md:h-[400px]">
                        {photo.map((src, index) => (
                            <div className="flex-shrink-0 flex-grow-0 basis-full relative" key={index}>
                                <Image fill sizes="(max-width: 880px) 560px, 640px"
                                        className="object-cover rounded-lg" src={src} alt={`Profile ${index}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* 이미지 인디케이터 */}
                <div className="flex justify-center pt-2">
                    {photo.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full mx-1 cursor-pointer
                                        ${index === selectedIndex ? 'bg-interactive-primary' : 'bg-[#ccc]'}`}
                            onClick={() => emblaApi?.scrollTo(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full pt-4 text-[16px] md:text-[17px]">
                <div className="mb-6">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-[24px] md:text-[26px] font-medium leading-none tracking-tight">{name_en}</h1>
                        {/* URL 복사 링크 아이콘 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentUrl = window.location.origin + window.location.pathname + '?view=card&id=' + encodeURIComponent(id || '');

                                // 클립보드 복사 시도 (지원되지 않는 경우 selectionless fallback)
                                const selectionlessCopy = () => {
                                    try {
                                        const listener = (event: any) => {
                                            event.preventDefault();
                                            if (event.clipboardData) {
                                                event.clipboardData.setData('text/plain', currentUrl);
                                            }
                                        };
                                        document.addEventListener('copy', listener);
                                        document.execCommand('copy');
                                        document.removeEventListener('copy', listener);
                                    } catch (err) {
                                        // 마지막 수단: 아무 동작 안 함 (iOS에서 입력 포커스 회피)
                                    }
                                };

                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    navigator.clipboard.writeText(currentUrl).catch(selectionlessCopy);
                                } else {
                                    selectionlessCopy();
                                }

                                // 중앙 토스트 (배경 없음, 작은 고정 요소만 추가)
                                const toast = document.createElement('div');
                                toast.textContent = 'Link copied!';
                                toast.className = 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg text-base font-medium z-[1000] pointer-events-none';
                                document.body.appendChild(toast);

                                // 1초 후 토스트 제거
                                setTimeout(() => {
                                    if (toast.parentNode) {
                                        toast.parentNode.removeChild(toast);
                                    }
                                }, 1000);
                            }}
                            className="w-5 h-5 text-gray-400 hover:text-interactive-primary transition-colors duration-200 flex-shrink-0"
                            title="Copy profile link"
                        >
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </button>
                    </div>
                    <h1 className="text-[20px] md:text-[22px]">{name_ko}</h1>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 mb-1`}>
                    <span className={`text-brand-primary highlight text-[18px] md:text-[19px] whitespace-nowrap`}>{title}</span>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 mb-1`}>
                    <span className={`text-brand-primary highlight-2 text-[18px] md:text-[19px]`}>{affiliation}</span>
                </div>
                <div className="my-3"></div>

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
                
                {/* Research Interests 섹션 - alumni가 아닌 경우에만 표시 */}
                {!isAlumniPage && interest.length > 0 && (
                    <>
                        <Separator className="my-3"/>
                        
                        {/* Research Interests */}
                        <div className={`grid gap-x-4 gap-y-1 my-3`}>
                            <span className={`text-text-accent font-medium`}>Research Interests</span>
                            <div className="">
                                {interest.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <span key={index} className="text-text-accent font-semibold pr-0.5 text-[15.5px] md:text-[16.5px]">#</span>
                                        <span className="pr-2 text-[15.5px] md:text-[16.5px]">{item.trim()} </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </>
                )}
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
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                </div>
                <Separator className="my-3"/>

                {/* Activities (Publication) */}
                {papers.length > 0 && (
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
                            {papers.slice(0, displayedPapersCount).map((paper: PaperData, index: number) => {
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
                                                                                , <span className={`inline-block text-[13px] px-2 py-1/2 rounded-full ${
                                                                                    paper.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                                                    paper.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                                    paper.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-brand-primary/10 text-brand-primary'
                                                                                }`}>
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
                                                                                , <span className={`inline-block text-[13px] px-2 py-1/2 rounded-full ${
                                                                                    paper.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                                                    paper.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                                    paper.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-brand-primary/10 text-brand-primary'
                                                                                }`}>
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
                                                                        , <span className={`inline-block text-[13px] px-2 py-1/2 rounded-full ${
                                                                            paper.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                                            paper.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                            paper.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-brand-primary/10 text-brand-primary'
                                                                        }`}>
                                                                            {paper.status}
                                                                        </span>
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                    <div className="text-[13px] md:text-[14px] text-text-secondary">
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
                            {papers.length > displayedPapersCount && (
                                <div className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-center">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                                            <button 
                                                onClick={() => setDisplayedPapersCount(prev => Math.min(prev + 5, papers.length))}
                                                className="text-[13.5px] md:text-[14.5px] text-text-secondary hover:text-interactive-primary hover:underline cursor-pointer"
                                            >
                                                See more ({displayedPapersCount} / {papers.length})
                                            </button>
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
                {studies.length > 0 && (
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
                            {studies.slice(0, displayedStudiesCount).map((study: StudyData, index: number) => (
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
                            {studies.length > displayedStudiesCount && (
                                <div className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-center">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[15px] md:text-[16px]">-</span>
                                            <button 
                                                onClick={() => setDisplayedStudiesCount(prev => Math.min(prev + 5, studies.length))}
                                                className="text-[13.5px] md:text-[14.5px] text-text-secondary hover:text-interactive-primary hover:underline cursor-pointer"
                                            >
                                                See more ({displayedStudiesCount} / {studies.length})
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
