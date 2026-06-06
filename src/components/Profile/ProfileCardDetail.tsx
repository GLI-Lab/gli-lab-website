"use client"

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'
import { Separator } from "@/components/ui/separator"
import { ProfileDetailProps } from '@/data/loaders/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { buildProfileSharePath, parseProfileColsParam } from '@/lib/profileSlug';
import { ProfileDetailPaper } from './ProfileDetailPaper';
import { ProfileDetailPatent } from './ProfileDetailPatent';
import { ProfileDetailProject } from './ProfileDetailProject';
import { ProfileDetailStudy } from './ProfileDetailStudy';

function WrappedContactEntries({
    items,
    renderItem,
}: {
    items: string[];
    renderItem: (item: string, index: number) => React.ReactNode;
}) {
    const filtered = items.filter((item) => typeof item === 'string' && item.trim() !== '');
    if (filtered.length === 0) {
        return <span className="text-[15.5px] md:text-[16.5px]">-</span>;
    }
    return (
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-1 gap-y-1">
            {filtered.map((item, index) => (
                <span key={index} className="max-w-full break-words">
                    {renderItem(item, index)}
                    {index < filtered.length - 1 ? ',' : ''}
                </span>
            ))}
        </div>
    );
}

export const ProfileCardDetail: React.FC<ProfileDetailProps & { isModal?: boolean }> = (props) => {
    const {id, yamlId, title, name_en, name_ko, admission, joined_start, joined_end, bs, ms, phd, photo, email, interest, homepage, github, linkedin, scholar, graduation, affiliation, cv, cvVersion, studies = [], papers = [], patents = [], projects = [], isAlumniPage = false, isModal = false } = props;
    const section = isAlumniPage ? 'alumni' : 'members';
    const searchParams = useSearchParams();
    const cardColumns = parseProfileColsParam(searchParams.get('cols') ?? undefined);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30}, [Fade()]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect(); // 초기 선택된 슬라이드 설정
    }, [emblaApi, onSelect]);

    const photoUrlsKey = photo.join('|');

    useEffect(() => {
        if (!emblaApi) return;
        setSelectedIndex(0);
        emblaApi.scrollTo(0);
    }, [photoUrlsKey, emblaApi]);

    const renderEducation = (
        label: string,
        edu: string[],
        addTopMargin: boolean = false
    ) => {
        const items = (edu || []).filter(item => typeof item === 'string' && item.trim() !== '');
        if (items.length === 0) return null;
        return items.map((item, idx) => {
            const commaIndex = item.indexOf(',');
            const before = commaIndex >= 0 ? item.slice(0, commaIndex).trim() : item.trim();
            const after = commaIndex >= 0 ? item.slice(commaIndex + 1).trim() : '';
            const groupTopMargin = addTopMargin && idx === 0 ? ' mt-1' : '';
            return (
                <React.Fragment key={idx}>
                    <span className={`text-text-accent font-medium${groupTopMargin}`}>{idx === 0 ? label : ''}</span>
                    <span className={`min-w-0 flex flex-wrap items-baseline gap-x-1 text-[15.5px] md:text-[16.5px] leading-snug pt-0.5${groupTopMargin}`}>
                        <span className="min-w-0">{after ? `${before},` : before}</span>
                        {after && (
                            <span className="max-w-full text-text-secondary italic text-[14.5px] md:text-[15.5px] break-words">
                                {after}
                            </span>
                        )}
                    </span>
                </React.Fragment>
            );
        });
    };

    return (
        <div className={`bg-white flex flex-col w-full ${isModal ? 'items-center' : 'items-start'}`}>
            <div className="embla w-[280px] 1.5md:w-[320px] shrink-0">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex w-[280px] h-[330px] 1.5md:w-[320px] 1.5md:h-[400px]">
                        {photo.map((src, index) => (
                            <div className="flex-shrink-0 flex-grow-0 basis-full relative" key={src}>
                                <Image
                                    fill
                                    sizes="(max-width: 880px) 560px, 640px"
                                    className="object-cover rounded-lg"
                                    src={src}
                                    alt={`Profile ${index}`}
                                    priority={isModal && index === 0}
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
            <div className={`w-full min-w-0 pt-4 text-[16px] md:text-[17px] ${isModal ? 'px-4 sm:px-6' : ''}`}>
                <div className="mb-6">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-[24px] md:text-[26px] font-medium leading-none tracking-tight">{name_en}</h1>
                        {/* URL 복사 링크 아이콘 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentUrl = `${window.location.origin}${buildProfileSharePath(section, id, 'card', cardColumns === 1 ? 1 : undefined)}`;

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

                                // 버튼 옆 토스트 (고정 위치, 버튼 오른쪽에 표시)
                                const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const toast = document.createElement('div');
                                toast.textContent = 'Link copied!';
                                toast.className = 'fixed bg-gray-600 text-white px-3 py-1.5 rounded-md shadow-md text-[15px] font-medium z-[1000] pointer-events-none';
                                toast.style.left = `${buttonRect.right + 10}px`;
                                toast.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
                                toast.style.transform = 'translateY(-50%)';
                                document.body.appendChild(toast);

                                // 1초 후 토스트 제거
                                setTimeout(() => {
                                    if (toast.parentNode) {
                                        toast.parentNode.removeChild(toast);
                                    }
                                }, 1000);

                                // 아이콘을 1초 동안 체크표시로 변경
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1000);
                            }}
                            className={`ml-0.5 mt-0.5 w-5 h-5 transition-colors duration-200 flex-shrink-0 ${copied ? 'text-brand-primary' : 'text-gray-400 hover:text-interactive-primary'}`}
                            title="Copy profile link"
                        >
                            {copied ? (
                                <svg className="w-full h-full origin-center scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            )}
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
                <div className={`grid grid-cols-[auto,minmax(0,1fr)] gap-x-4 items-start`}>
                    {renderEducation('B.S.', bs)}
                    {renderEducation('M.S.', ms, true)}
                    {renderEducation('Ph.D.', phd, true)}
                </div>
                <Separator className="my-3"/>

                {/* Contact */}
                <div className={`grid grid-cols-[auto,minmax(0,1fr)] gap-x-4 gap-y-1 items-start`}>
                    <span className={`text-text-accent font-medium`}>CV</span>
                    <div className="flex flex-col">
                        {cv ? (
                            <a href={cv} target="_blank" rel="noopener noreferrer" title="Download CV"
                               className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                CV{cvVersion ? ` (${cvVersion})` : ''}
                            </a>
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>Email</span>
                    <WrappedContactEntries
                        items={email}
                        renderItem={(src) => (
                            <a
                                href={`mailto:${src}`}
                                className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]"
                            >
                                {src}
                            </a>
                        )}
                    />
                </div>
                <Separator className="my-3"/>

                {/* Links */}
                <div className={`grid grid-cols-[auto,minmax(0,1fr)] gap-x-4 gap-y-1 items-start`}>
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
                    <WrappedContactEntries
                        items={github}
                        renderItem={(src) => (
                            <a
                                href={src}
                                rel=""
                                title={src}
                                target="_blank"
                                className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]"
                            >
                                {src.replace("https://github.com/", "")}
                            </a>
                        )}
                    />
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
                    <span className={`text-text-accent font-medium`}>Scholar</span>
                    <div className="flex flex-col">
                        {scholar.length > 0 && scholar.some(s => s.trim() !== '') ? (
                            scholar.filter(s => s.trim() !== '').map((src, index) => (
                                <a href={src} rel="" title={src} target="_blank" key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://scholar.google.com/citations?user=", "")}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                </div>
                <Separator className="my-3"/>

                <ProfileDetailPaper papers={papers} profileYamlId={yamlId || ''} />
                <ProfileDetailPatent patents={patents} profileYamlId={yamlId || ''} />
                <ProfileDetailProject projects={projects} profileId={yamlId || ''} />
                <ProfileDetailStudy studies={studies} profileYamlId={yamlId || ''} />
            </div>
        </div>
    );
};
