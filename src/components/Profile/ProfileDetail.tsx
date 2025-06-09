"use client"

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'
import { Separator } from "@/components/ui/separator"
import { ProfileDetailProps, parseAuthorString, findUserRoleInPaper } from './profiles';
import { StudyData } from '../Study/studyData';
import { PaperData } from './profiles';
import Link from 'next/link';

export const ProfileDetail: React.FC<ProfileDetailProps> = (props) => {
    const {id, title, name_en, name_ko, admission, joined, bs, ms, phd, photo, email, interest, current_work, homepage, github, linkedin, academic_year, academic_semester, studies = [], papers = [] } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30}, [Fade()]);
    const [selectedIndex, setSelectedIndex] = useState(0);

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

    // Status에 따른 아이콘 반환
    const getStatusIcon = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'in progress':
                return '🛠';
            case 'published':
                return '📄';
            case 'accepted':
                return '✅';
            case 'submitted':
                return '⏳';
            default:
                return '📝';
        }
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
            <div className="w-full pt-3 text-[16px] md:text-[17px]">
                <div className="mb-6">
                    <h1 className="text-[24px] md:text-[26px] font-bold leading-none">{name_ko}</h1>
                    <h1 className="text-[20px] md:text-[22px]">{name_en}</h1>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1`}>
                    <span className={`text-brand-primary highlight text-[18px] md:text-[19px]`}>{title}</span>
                </div>
                <div className="my-3"></div>

                {/* Status */}
                <div className="grid grid-cols-[auto,1fr] gap-x-4 items-center">
                    {academic_year && academic_semester && (
                        <><span className={`text-text-accent font-medium`}>Status</span><span className="text-[15.5px] md:text-[16.5px]">{academic_year}학년 {academic_semester}학기</span></>
                    )}
                    {admission && (
                        <><span className={`text-text-accent font-medium`}>Admission</span><span className="text-[15.5px] md:text-[16.5px]">{admission}</span></>
                    )}
                    {joined && (
                        <><span className={`text-text-accent font-medium`}>Joined</span><span className="text-[15.5px] md:text-[16.5px]">{joined}</span></>
                    )}
                </div>
                <Separator className="my-3"/>

                {/* Research Interests */}
                {interest.length > 0 && (
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
                )}

                {/* Current Work */}
                {current_work.length > 0 && (
                    <div className={`grid gap-x-4 gap-y-1 my-3`}>
                        <span className={`text-text-accent font-medium`}>Current Work</span>
                        <div className="">
                            {current_work.map((work, index) => (
                                <div key={index} className="mb-1 leading-snug">
                                    <span className="text-text-accent font-semibold pr-0.5 text-[15.5px] md:text-[16.5px]">-</span>
                                    <span className="text-[15.5px] md:text-[16.5px]">{work}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Separator className="my-3"/>

                {/* Education */}
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 items-center`}>
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
                            {studies.slice(0, 5).map((study: StudyData, index: number) => (
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
                                                <span className="text-[10px] font-semibold bg-green-100 text-brand-primary px-1 py-0.5 rounded">
                                                    NOW
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {studies.length > 5 && (
                                <div className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-center">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[15px] md:text-[16px]">-</span>
                                            <span className="text-[13.5px] md:text-[14.5px] text-text-secondary">
                                                ... (+{studies.length - 5} more)
                                            </span>
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
                <div className="my-2"></div>
                
                {/* Activities (Publication) */}
                {papers.length > 0 && (
                    <div className={`grid gap-x-4 gap-y-1 `}>
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
                            {papers.slice(0, 5).map((paper: PaperData, index: number) => {
                                // Find current user's role in this paper using explicit role information
                                const userRole = findUserRoleInPaper(paper.authors, id);

                                return (
                                    <div key={paper.title} className="mb-1.5 leading-snug">
                                        <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-start">
                                            <div className="flex items-start">
                                                <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                                                <Link 
                                                    href="https://bkoh509.github.io" 
                                                    className="text-[14px] md:text-[15px] hover:text-interactive-hover hover:underline underline-offset-4"
                                                    title=""
                                                >
                                                    {paper.title}
                                                </Link>
                                            </div>
                                            <div className="whitespace-nowrap mt-0.5">
                                                <div className="text-[12.5px] text-text-accent leading-tight">
                                                    {paper.status}
                                                </div>
                                                {userRole && (
                                                    <div className="text-[11.5px] text-text-secondary italic text-center">
                                                        ({userRole})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {papers.length > 5 && (
                                <div className="mb-1.5 leading-snug">
                                    <div className="grid grid-cols-[auto,1fr,auto] gap-0 items-center">
                                        <div className="flex items-start">
                                            <span className="text-text-accent font-semibold pr-0.5 text-[14px] md:text-[16px]">-</span>
                                            <span className="text-[13px] md:text-[14px] text-text-secondary">
                                                ... (+{papers.length - 5} more)
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
            </div>
        </div>
    );
}; 