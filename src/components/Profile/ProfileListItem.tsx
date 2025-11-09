"use client"

import Image from 'next/image';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProfileItemProps } from '@/data/loaders/types';
import { ProfileListDetail } from './ProfileListDetail';
import { type StudyData, type PaperData, type PatentData } from '@/data/loaders/types';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'

interface ProfileListItemProps extends ProfileItemProps {
    studies?: StudyData[];
    papers?: PaperData[];
    patents?: PatentData[];
}

export const ProfileListItem: React.FC<ProfileListItemProps> = (props) => {
    const { onClick, type, name_en, name_ko, admission, photo, email, isSelected, joined_start, joined_end, graduation, affiliation, isAlumniPage, studies = [], papers = [], patents = [], bs, ms, phd, interest, homepage, github, linkedin, title } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Ref for scrolling to top when expanded
    const profileRef = useRef<HTMLDivElement>(null);
    const detailRef = useRef<HTMLDivElement>(null);
    
    // Embla carousel setup
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30}, [Fade()]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect();
    }, [emblaApi, onSelect]);

    useEffect(() => {
        setSelectedIndex(0);
        emblaApi?.scrollTo(0);
    }, [photo, emblaApi]);

    // Scroll to detail section on mobile after expansion
    useEffect(() => {
        if (isExpanded) {
            const isMobile = window.innerWidth < 768;
            if (isMobile && detailRef.current) {
                detailRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }, [isExpanded]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        
        if (!isExpanded && profileRef.current) {
            profileRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    };

    return (
        // <div className="bg-white border border-gray-200 rounded-lg  transition-all duration-300 hover:shadow-md">
        <div className="">
            {/* Main Row */}
            <div
                onClick={onClick}
                className="px-2 pt-4 pb-0 md:py-2 flex flex-col md:flex-row gap-6 md:gap-10 group transition-all duration-200 scroll-mt-24"
                ref={profileRef}
            >
                {/* Profile Image */}
                <div className="w-[280px] h-[330px] md:w-[250px] md:h-[300px] relative flex-shrink-0 mx-auto md:mx-0">
                    <div className="embla w-full h-full">
                        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
                            <div className="flex w-full h-full">
                                {photo.map((src, index) => (
                                    <div className="flex-shrink-0 flex-grow-0 basis-full relative w-full h-full" key={index}>
                                        <Image 
                                            fill 
                                            sizes="(max-width: 880px) 280px, 280px"
                                            className="object-cover rounded-md" 
                                            src={src} 
                                            alt={`Profile ${index}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* 이미지 인디케이터 */}
                        {photo.length > 1 && (
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
                        )}
                    </div>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 py-3 md:pr-1 flex flex-col space-y-3 md:space-y-0 justify-between scroll-mt-16" ref={detailRef}>
                    <div className={`text-2xl md:text-2xl font-semibold mb-3 md:mb-0 text-center md:text-left flex items-center gap-1.5`}>
                        <span>{name_en} ({name_ko})</span>
                        {/* URL 복사 링크 아이콘 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentUrl = window.location.origin + window.location.pathname + '?view=list&id=' + encodeURIComponent(props.id || '');

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
                            className={`mt-0.5 w-5 h-5 transition-colors duration-200 flex-shrink-0 ${copied ? 'text-brand-primary' : 'text-gray-400 hover:text-interactive-primary'}`}
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
                    
                    {/* Faculty Information */}
                    {type === "faculty" ? (
                        <div className="space-y-3 text-left tracking-normal sm:tracking-normal">
                            <div className={`text-lg font-medium`}>
                                {title}
                            </div>
                            <div className={`grid grid-cols-[auto,1fr] gap-x-4 text-base md:text-lg font-medium`}>
                                <span>Affiliation:</span>
                                <span className="font-normal text-gray-600">Dept. of Computer Science & Engineering</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-left">
                            <div className={`text-lg font-medium`}>{title}</div>
                        </div>
                    )}
                    

                    {/* Status */}
                    <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-0 tracking-normal sm:tracking-normal text-base md:text-lg ${type === "faculty" ? "mt-3" : ""} text-left`}>
                        {isAlumniPage && (admission || graduation) ? (
                            <>
                                {affiliation && (
                                    <>
                                        <span className={`font-medium`}>Status</span>
                                        <span className="font-semibold underline">{affiliation}</span>
                                    </>
                                )}
                                <span className={`font-medium`}>Period</span>
                                <span>
                                    {admission && graduation ? `${admission} - ${graduation}` : 
                                     admission ? `${admission} - ` : 
                                     graduation ? ` - ${graduation}` : 'N/A'}
                                </span>
                            </>
                        ) : (type === "intern") || (type === "pms") || (type === "pphd") ? (
                            <>
                                <span className={`font-medium`}>Joined</span>
                                <span>{joined_start && joined_end ? `${joined_start} - ${joined_end}` : 'N/A'}</span>
                            </>
                        ) : type === "faculty" ? (
                            <>
                                <span className={`font-medium`}>Office</span>
                                <span className="font-normal text-gray-600">C384-2, Engineering Hall</span>
                            </>
                        ) : (
                            <>
                                <span className={`font-medium`}>Admission</span>
                                <span className="font-normal text-gray-600">{admission}</span>
                            </>
                        )}
                        <span className={`font-medium`}>E-mail</span>
                        <span className="font-normal text-gray-600">{email.length > 0 && email[0].trim() !== '' ? email[0] : 'N/A'}</span>
                    </div>
                    
                    {/* Research Interests */}
                    {type !== "faculty" && interest && interest.length > 0 && (
                        <div className="text-base md:text-lg text-left tracking-normal">
                            <div className={`font-medium`}>
                                Research Interests:
                            </div>
                            <div className="flex flex-wrap gap-2 gap-y-0 tracking-normal">
                                {interest.map((item, index) => (
                                    <div key={index} className="flex items-center text-base">
                                        <span className="text-gray-500 font-semibold pr-0.5">#</span>
                                        <span className="text-gray-500">{item.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Social Links - positioned at the bottom */}
                    <div className="flex flex-row gap-2 items-center justify-between">
                        <div className="flex gap-3">
                            {/* Email */}
                            {email.length > 0 && email[0].trim() !== '' && (
                                <a 
                                    href={`mailto:${email[0]}`}
                                    className="w-9 h-9 bg-gray-100 hover:bg-interactive-primary hover:text-white text-gray-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Email"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            )}
                            
                            {/* Homepage */}
                            {homepage && homepage.length > 0 && homepage.some(h => h.trim() !== '') && (
                                <a 
                                    href={homepage[0]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-100 hover:bg-interactive-primary hover:text-white text-gray-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Homepage"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </a>
                            )}
                            
                            {/* GitHub */}
                            {github && github.length > 0 && github.some(g => g.trim() !== '') && (
                                <a 
                                    href={github[0]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-100 hover:bg-interactive-primary hover:text-white text-gray-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                                    onClick={(e) => e.stopPropagation()}
                                    title="GitHub"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                </a>
                            )}
                            
                            {/* LinkedIn */}
                            {linkedin && linkedin.length > 0 && linkedin.some(l => l.trim() !== '') && (
                                <a 
                                    href={linkedin[0]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-gray-100 hover:bg-interactive-primary hover:text-white text-gray-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                                    onClick={(e) => e.stopPropagation()}
                                    title="LinkedIn"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                        
                        {/* See more button - positioned at the right end */}
                        <button
                            onClick={handleToggle}
                            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-all duration-200 font-medium text-[15px] md:text-base hover:underline"
                        >
                            <span>
                                {isExpanded ? 'Hide' : 'See more'}
                            </span>
                            <svg 
                                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Expandable Detail Section */}
            {isExpanded && (
                <div className="bg-gray-100 px-4 md:px-8 py-5 md:py-8 md:mt-6 transition-all duration-300 rounded-xl">
                    <ProfileListDetail 
                        {...props} 
                        studies={studies} 
                        papers={papers} 
                        patents={patents}
                        isAlumniPage={isAlumniPage}
                    />
                </div>
            )}
        </div>
    );
};
