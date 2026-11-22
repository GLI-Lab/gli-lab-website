"use client"

import Image from 'next/image';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProfileItemProps, type ProfileLinks } from '@/data/loaders/types';
import { ProfileListDetail } from './ProfileListDetail';
import { ProfileTitleText } from './ProfileTitleMarker';
import { type StudyData, type PaperData, type PatentData, type ProjectData, type SeminarData } from '@/data/loaders/types';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'
import { buildProfileSharePath } from '@/lib/profileSlug';
import { hasAffiliation, ProfileAffiliationText } from './ProfileAffiliationText';
import { isActiveCaptain, ProfileCaptainBadge } from './ProfileCaptainBadge';
import { copyLinkWithToast } from '@/lib/copyLink';
import { ViewCount } from '@/components/ViewCount';

interface ProfileListItemProps extends ProfileItemProps {
    studies?: StudyData[];
    papers?: PaperData[];
    patents?: PatentData[];
    projects?: ProjectData[];
    seminars?: SeminarData[];
    profileLinks?: ProfileLinks;
}

// 이름 아래 정보의 글자 모양. 크기는 프로필 상세(ProfileCardDetail)와 같은 값을 쓴다.
// 직함·학기: 17px(넓은 화면 18px), 굵기 500, 기본 글자색. leading-7: 줄 높이 28px 고정
const TITLE_STYLE = 'text-[17px] md:text-[18px] leading-7 font-medium';
// 항목 이름(Affiliation, Joined, E-mail, Research Interests 등)은 16px(넓은 화면 17px), 실제 값은 그보다 0.5px 작다.
// 색은 둘 다 기본 글자색이고, 행에 마우스를 올리면 항목 이름만 초록이 된다 (프로필 카드 ProfileCardItem과 같은 방식).
const INFO_LABEL_SIZE = 'text-[16px] md:text-[17px]';
const INFO_LABEL_STYLE = 'font-medium group-hover:text-interactive-primary';
const INFO_VALUE_SIZE = 'text-[15.5px] md:text-[16.5px]';

// 아래쪽 링크 버튼(CV, 메일, 홈페이지 등)과 그 안의 아이콘 크기. 모바일에서는 넓은 화면보다 2px씩 작다.
// flex-shrink-0: 자리가 모자라도 찌그러지지 않고, 대신 버튼 줄이 옆으로 밀린다 (아래 linksRef 참고)
const LINK_BUTTON_STYLE = 'flex-shrink-0 w-[34px] h-[34px] md:w-9 md:h-9 bg-gray-100 hover:bg-interactive-primary hover:text-white text-gray-600 rounded-lg flex items-center justify-center transition-all duration-200 group';
const LINK_ICON_LINE_SIZE = 'w-[26px] h-[26px] md:w-7 md:h-7';   // 선으로 그린 아이콘 (CV, 메일, 홈페이지)
const LINK_ICON_SOLID_SIZE = 'w-[22px] h-[22px] md:w-6 md:h-6';  // 면을 채운 아이콘 (GitHub, LinkedIn, Scholar)

export const ProfileListItem: React.FC<ProfileListItemProps> = (props) => {
    const { onClick, type, name_en, name_ko, admission, photo, email, isSelected, joined_start, joined_end, graduation, affiliation, captain, isAlumniPage = false, studies = [], papers = [], patents = [], projects = [], seminars = [], bs, ms, phd, interest, homepage, github, linkedin, scholar, cv, title, id } = props;
    const section = isAlumniPage ? 'alumni' : 'members';
    // 상세가 펼쳐져 있는지. 주소가 이 사람 주소면(isSelected) 처음부터 펼쳐서 그린다 (공유 링크로 들어온 경우 등).
    const [isExpanded, setIsExpanded] = useState(isSelected ?? false);

    // 화면에 머무는 중에 주소가 이 사람으로 바뀌어도(상세 안의 사람 링크 등) 펼친다. 접는 것은 사용자가 직접 한다.
    useEffect(() => {
        if (isSelected) setIsExpanded(true);
    }, [isSelected]);
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

    // 링크 버튼 줄: 버튼이 많아 한 줄에 다 들어가지 않으면(좁은 화면) 옆으로 밀어서 본다.
    // 버튼이 더 있는 쪽 끝에 화살표를 띄워 알려 준다.
    const linksRef = useRef<HTMLDivElement>(null);
    const [linksMore, setLinksMore] = useState({ left: false, right: false });

    const updateLinksMore = useCallback(() => {
        const el = linksRef.current;
        if (!el) return;
        const left = el.scrollLeft > 1;
        const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
        setLinksMore((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    }, []);

    useEffect(() => {
        const el = linksRef.current;
        if (!el) return;
        updateLinksMore();
        // 화면 폭이 바뀌면 넘치는지 여부가 달라진다
        const observer = new ResizeObserver(updateLinksMore);
        observer.observe(el);
        return () => observer.disconnect();
    }, [updateLinksMore]);

    // 화살표를 누르면 그쪽 끝까지 민다
    const slideLinks = (e: React.MouseEvent, side: 'left' | 'right') => {
        e.stopPropagation();
        const el = linksRef.current;
        if (!el) return;
        el.scrollTo({ left: side === 'right' ? el.scrollWidth : 0, behavior: 'smooth' });
    };

    // 행을 누르든 See more / Hide를 누르든 같은 동작이다: 접혀 있으면 펼치고, 펼쳐져 있으면 접는다.
    // 펼칠 때는 주소도 이 사람 주소로 바꾸고(onClick) 행을 화면 위쪽으로 올린다. 접을 때는 주소를 그대로 둔다.
    const toggleDetail = () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }
        setIsExpanded(true);
        onClick?.();
        profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleRowClick = () => {
        // 글자를 드래그해 선택한 것(메일 주소 복사 등)은 클릭으로 치지 않는다
        if (window.getSelection()?.toString()) return;
        toggleDetail();
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleDetail();
    };

    return (
        // <div className="bg-white border border-gray-200 rounded-lg  transition-all duration-300 hover:shadow-md">
        <div className="">
            {/* Main Row. 행 어디를 눌러도 See more / Hide를 누른 것과 같다 (카드형에서 카드를 누르는 것과 같은 방식).
                그래서 카드처럼 손 모양 커서를 쓰고, 행 위에 마우스가 있으면 행 바탕이 옅은 회색이 되고(md:hover:bg-gray-50)
                See more 버튼이 호버된 모양이 된다 (group). 바탕색은 넓은 화면에서만: 터치 화면에서는 누른 뒤에도 색이 남는다.
                md:py-6 md:-my-4: 호버 상자를 위아래로 16px씩 늘려 사진 아래 점(사진 밖으로 18px 나와 있다)까지 감싼다.
                늘린 만큼 바깥 여백을 음수로 주어 주변 배치는 그대로다. 사진 위치가 상자 머리에서 16px 내려갔으므로
                스크롤 여백도 넓은 화면에서 그만큼 줄인다 (md:scroll-mt-20) */}
            <div
                onClick={handleRowClick}
                className="px-2 pt-3 pb-0 md:py-6 md:-my-4 flex flex-col md:flex-row gap-5 md:gap-8 group cursor-pointer rounded-xl md:hover:bg-gray-50 transition-all duration-200 scroll-mt-24 md:scroll-mt-20"
                ref={profileRef}
            >
                {/* Profile Image */}
                <div className="w-[250px] h-[295px] md:w-[220px] md:h-[264px] relative flex-shrink-0 mx-auto md:mx-0">
                    <div className="embla w-full h-full">
                        <div className="relative w-full h-full">
                            <div className="overflow-hidden w-full h-full" ref={emblaRef}>
                                <div className="flex w-full h-full">
                                    {photo.map((src, index) => (
                                        <div className="flex-shrink-0 flex-grow-0 basis-full relative w-full h-full" key={index}>
                                            <Image 
                                                fill 
                                                sizes="250px"
                                                quality={100}
                                                className="object-cover rounded-md" 
                                                src={src} 
                                                alt={`Profile ${index}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {isActiveCaptain(captain) && captain && <ProfileCaptainBadge captain={captain} size="list" />}
                        </div>
                        
                        {/* 이미지 인디케이터 */}
                        {photo.length > 1 && (
                            <div className="flex justify-center pt-2">
                                {photo.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-2.5 h-2.5 rounded-full mx-1 cursor-pointer
                                                    ${index === selectedIndex ? 'bg-interactive-primary' : 'bg-[#ccc]'}`}
                                        onClick={(e) => {
                                            // 사진만 넘긴다 (행 클릭으로 번져 상세가 펼쳐지거나 접히지 않게)
                                            e.stopPropagation();
                                            emblaApi?.scrollTo(index);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 py-2 md:py-1 md:pr-1 flex flex-col space-y-2 md:space-y-0 justify-between scroll-mt-16" ref={detailRef}>
                    {/* 이름 아래 여백(mb): 넓은 화면에서는 행 높이가 사진 높이로 고정이고 남는 공간을 justify-between이 고르게 나눈다.
                        여기에 여백을 주면 이름 아래 간격만 그만큼 넓어지고 나머지 간격이 조금씩 줄어, 행 높이는 그대로다. */}
                    <div className={`mb-1 lg:mb-2 text-center md:text-left flex items-center gap-1.5`}>
                        {/* 굵기·자간은 카드형 상세(ProfileCardDetail)의 영문 이름과 같다. 크기는 영문·한글을 한 줄에 쓰므로 그보다 2px 작게.
                            한글 이름은 카드형 상세처럼 영문보다 2px 작고 보통 굵기. leading-8: 줄 높이 32px 고정.
                            행에 마우스를 올리면 프로필 카드(ProfileCardItem)처럼 이름이 초록색이 된다 */}
                        <span className="text-[22px] md:text-[24px] font-medium leading-8 tracking-tight group-hover:text-interactive-primary">
                            {name_en} <span className="text-[20px] md:text-[22px] font-normal">({name_ko})</span>
                        </span>
                        {/* URL 복사 링크 아이콘 */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentUrl = `${window.location.origin}${buildProfileSharePath(section, id)}`;

                                // 주소를 복사하고 버튼 옆에 "Link copied!"를 띄운다 (화면 밖으로 나가지 않는 자리를 고름)
                                copyLinkWithToast(currentUrl, e.currentTarget);

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
                        {/* 조회수: 이름 줄의 오른쪽 끝 (카드형 상세와 같은 자리). pr-3: 아래 "See more" 버튼의 안쪽 여백과 오른쪽 끝을 맞춘다 */}
                        <ViewCount id={id} className="ml-auto pr-3" />
                    </div>

                    {/* Faculty Information */}
                    {type === "faculty" ? (
                        <div className="space-y-3 text-left tracking-normal sm:tracking-normal">
                            <div className={TITLE_STYLE}><ProfileTitleText type={type} title={title} /></div>
                            <div className={`grid grid-cols-[auto,1fr] gap-x-4 ${INFO_LABEL_SIZE} items-center`}>
                                <span className={INFO_LABEL_STYLE}>Affiliation:</span>
                                <span className={INFO_VALUE_SIZE}>Dept. of Computer Science & Engineering</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-left">
                            <div className={TITLE_STYLE}><ProfileTitleText type={type} title={title} /></div>
                        </div>
                    )}
                    

                    {/* Status */}
                    <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-0 tracking-normal sm:tracking-normal ${INFO_LABEL_SIZE} items-center ${type === "faculty" ? "mt-3" : ""} text-left`}>
                        {isAlumniPage && (hasAffiliation(affiliation) || joined_start || joined_end) ? (
                            <>
                                {hasAffiliation(affiliation) && (
                                    <>
                                        <span className={`${INFO_LABEL_STYLE} self-start`}>Affiliation</span>
                                        <span className={`self-start min-w-0 ${INFO_VALUE_SIZE}`}>
                                            <ProfileAffiliationText
                                                affiliation={affiliation}
                                                currentClassName="font-semibold underline"
                                            />
                                        </span>
                                    </>
                                )}
                                <span className={INFO_LABEL_STYLE}>Joined</span>
                                <span className={INFO_VALUE_SIZE}>
                                    {joined_start && joined_end ? `${joined_start} - ${joined_end}` :
                                     joined_start ? `${joined_start} - ` :
                                     joined_end ? ` - ${joined_end}` : 'N/A'}
                                </span>
                            </>
                        ) : (type === "intern") || (type === "pms") || (type === "pphd") ? (
                            <>
                                <span className={INFO_LABEL_STYLE}>Joined</span>
                                <span className={INFO_VALUE_SIZE}>{joined_start && joined_end ? `${joined_start} - ${joined_end}` : 'N/A'}</span>
                            </>
                        ) : type === "faculty" ? (
                            <>
                                <span className={INFO_LABEL_STYLE}>Office</span>
                                <span className={INFO_VALUE_SIZE}>C384-2, Engineering Hall</span>
                            </>
                        ) : (
                            <>
                                <span className={INFO_LABEL_STYLE}>Admission</span>
                                <span className={INFO_VALUE_SIZE}>{admission}</span>
                            </>
                        )}
                        <span className={INFO_LABEL_STYLE}>E-mail</span>
                        <span className={`min-w-0 break-all ${INFO_VALUE_SIZE}`}>{email.length > 0 && email[0].trim() !== '' ? email[0] : 'N/A'}</span>
                    </div>
                    
                    {/* Research Interests */}
                    {type !== "faculty" && interest && interest.length > 0 && (
                        <div className={`${INFO_LABEL_SIZE} text-left tracking-normal`}>
                            <div className={INFO_LABEL_STYLE}>
                                Research Interests:
                            </div>
                            <div className="flex flex-wrap gap-2 gap-y-0 tracking-normal">
                                {interest.map((item, index) => (
                                    <div key={index} className={`flex items-center ${INFO_VALUE_SIZE}`}>
                                        <span className="text-gray-500 group-hover:text-interactive-primary font-semibold pr-0.5">#</span>
                                        <span className="text-gray-500">{item.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Social Links - positioned at the bottom */}
                    <div className="flex flex-row gap-2 items-center justify-between">
                        <div className="relative min-w-0">
                            {/* 넓은 화면에서는 넘칠 일이 없으므로 overflow를 풀어 둔다 (포커스 테두리가 잘리지 않게) */}
                            <div
                                ref={linksRef}
                                onScroll={updateLinksMore}
                                className="flex gap-2.5 md:gap-3 overflow-x-auto md:overflow-visible scrollbar-hide"
                            >
                                {/* CV */}
                                {cv && (
                                    <a 
                                        href={cv} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={LINK_BUTTON_STYLE}
                                        onClick={(e) => e.stopPropagation()}
                                        title="CV"
                                    >
                                        <svg className={LINK_ICON_LINE_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </a>
                                )}

                                {/* Email */}
                                {email.length > 0 && email[0].trim() !== '' && (
                                    <a 
                                        href={`mailto:${email[0]}`}
                                        className={LINK_BUTTON_STYLE}
                                        onClick={(e) => e.stopPropagation()}
                                        title="Email"
                                    >
                                        <svg className={LINK_ICON_LINE_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </a>
                                )}
                            
                                {/* 구분선 - 이후 아이콘이 있을 때만 표시 */}
                                {((homepage && homepage.length > 0 && homepage.some(h => h.trim() !== '')) ||
                                  (github && github.length > 0 && github.some(g => g.trim() !== '')) ||
                                  (linkedin && linkedin.length > 0 && linkedin.some(l => l.trim() !== '')) ||
                                  (scholar && scholar.length > 0 && scholar.some(s => s.trim() !== ''))) && (
                                    <div className="flex-shrink-0 h-[34px] md:h-9 w-px bg-gray-300"></div>
                                )}
                            
                                {/* Homepage */}
                                {homepage && homepage.length > 0 && homepage.some(h => h.trim() !== '') && (
                                    <a 
                                        href={homepage[0]} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={LINK_BUTTON_STYLE}
                                        onClick={(e) => e.stopPropagation()}
                                        title="Homepage"
                                    >
                                        <svg className={LINK_ICON_LINE_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className={LINK_BUTTON_STYLE}
                                        onClick={(e) => e.stopPropagation()}
                                        title="GitHub"
                                    >
                                        <svg className={LINK_ICON_SOLID_SIZE} fill="currentColor" viewBox="0 0 24 24">
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
                                        className={LINK_BUTTON_STYLE}
                                        onClick={(e) => e.stopPropagation()}
                                        title="LinkedIn"
                                    >
                                        <svg className={LINK_ICON_SOLID_SIZE} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </a>
                                )}
                            
                                {/* Google Scholar */}
                                {scholar && scholar.length > 0 && scholar.some(s => s.trim() !== '') && (
                                    <a 
                                        href={scholar[0]} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={LINK_BUTTON_STYLE}
                                        onClick={(e) => e.stopPropagation()}
                                        title="Google Scholar"
                                    >
                                        <svg className={LINK_ICON_SOLID_SIZE} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                                        </svg>
                                    </a>
                                )}
                            </div>
                            {/* 옆으로 더 밀 수 있다는 표시. 프로필 모달 아래쪽의 스크롤 표시(흰 그라데이션 + 튀는 화살표)를 옆으로 돌린 것이다.
                                바로 옆 See more의 화살표와 헷갈리지 않게 모달보다 작고 회색이다.
                                via-white: 회색 화살표가 밑에 깔린 회색 아이콘과 섞이지 않도록, 화살표 자리(바깥쪽 절반)는 완전히 흰색으로 덮는다.
                                화살표 자리를 눌렀을 때 밑에 깔린 링크가 열리지 않도록 버튼으로 두고, 누르면 그쪽 끝까지 민다 */}
                            {(['left', 'right'] as const).map((side) => (
                                <button
                                    key={side}
                                    type="button"
                                    aria-label={side === 'left' ? 'Show previous links' : 'Show more links'}
                                    aria-hidden={!linksMore[side]}
                                    tabIndex={linksMore[side] ? 0 : -1}
                                    onClick={(e) => slideLinks(e, side)}
                                    className={`absolute inset-y-0 w-7 flex items-center from-white via-white to-transparent transition-opacity duration-300 ease-in-out ${
                                        side === 'left' ? 'left-0 justify-start bg-gradient-to-r' : 'right-0 justify-end bg-gradient-to-l'
                                    } ${linksMore[side] ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                >
                                    {/* 모달의 아래 화살표를 90도 돌려 옆을 가리키게 한다. 위아래로 튀는 animate-bounce도 함께 돌아가 좌우로 튄다 */}
                                    <span className={`block ${side === 'left' ? 'rotate-90' : '-rotate-90'}`}>
                                        <svg
                                            className={`h-3.5 w-3.5 text-gray-500 ${linksMore[side] ? 'animate-bounce' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2 9l10 10 10-10" />
                                        </svg>
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        {/* See more button - positioned at the right end. 항상 한 줄이고, 자리가 모자라면 왼쪽 버튼 줄이 밀린다.
                            화살표 아이콘은 두지 않는다 (왼쪽 버튼 줄의 슬라이드 화살표와 나란히 놓여 헷갈린다).
                            굵기(보통)와 호버 색(초록 + 밑줄)은 프로필 카드의 See more와 같다 */}
                        <button
                            onClick={handleToggle}
                            className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-gray-600 hover:text-interactive-primary group-hover:text-interactive-primary transition-all duration-200 text-[14px] md:text-[15px] hover:underline group-hover:underline"
                        >
                            {isExpanded ? 'Hide' : 'See more'}
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
                        projects={projects}
                        seminars={seminars}
                        isAlumniPage={isAlumniPage}
                    />
                </div>
            )}
        </div>
    );
};
