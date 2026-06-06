"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProfileCardItem } from './ProfileCardItem';
import { ProfileListItem } from './ProfileListItem';
import { ProfileCardDetail } from './ProfileCardDetail';
import { type ProfileData, type PaperData, type StudyData, type PatentData, type ProjectData } from '@/data/loaders/types';
import { getPapersForProfile, getPatentsForProfile } from '@/data/loaders/utils';
import { buildProfilePath, DEFAULT_MEMBER_PROFILE_YAML_ID, getProfileSectionBasePath } from '@/data/loaders/profileSlug';

interface ProfileCardsProps {
    profiles: ProfileData[];
    selectedProfile?: ProfileData | null;
    /** URL path에 포함된 slug (목록 페이지면 null) */
    activeSlug?: string | null;
    studies?: StudyData[];
    papers?: PaperData[];
    patents?: PatentData[];
    projects?: ProjectData[];
    isAlumniPage?: boolean; // alumni 페이지인지 여부
    initialIsCardView?: boolean; // SSR 단계에서 초기 뷰 모드 지정
}

// 현재 프로필과 관련된 스터디를 필터링하는 함수
const filterStudiesForProfile = (allStudies: StudyData[], profile: ProfileData) => {
    return allStudies.filter(study => 
        study.participants.some(participant => {
            // <profile=[date] name>Full Name</> 형식 파싱
            const profileMatch = participant.match(/^<profile=(.+?)>(.+?)<\/>$/);
            if (profileMatch) {
                const [, id, ] = profileMatch;
                return id === profile.yamlId;
            }
        })
    );
};

export function ProfileCards({ profiles, selectedProfile, activeSlug = null, studies = [], papers = [], patents = [], projects = [], isAlumniPage = false, initialIsCardView = true }: ProfileCardsProps) {
    const profileBasePath = getProfileSectionBasePath(isAlumniPage ? 'alumni' : 'members');
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileData | null>(selectedProfile || null);
    
    const searchParams = useSearchParams();
    const pathname = usePathname();
    // 모바일 모달: URL detail 파라미터 + detailSuppressed state 조합
    // - urlDetailOpen (?detail=1): 열기의 source of truth. 공유·뒤로가기·리마운트 후에도 유지.
    //   직접 URL 접근(detail 없음) → 모달 안 열림 / 클릭 시 detail=1 → 모달 열림
    // - detailSuppressed: 닫기 즉시 반영용 optimistic state. X·배경·ESC 시 router URL 갱신을
    //   UI가 기다리지 않도록 함 (searchParams만 쓰면 router.replace 완료까지 모달이 남음)
    // - isDetailOpen = urlDetailOpen && !detailSuppressed
    // init과 달리 state는 닫기만 담당하고 URL과 같은 방향(닫힘)이라 리마운트 시 충돌 없음
    const urlDetailOpen = searchParams.get('detail') === '1';
    const [detailSuppressed, setDetailSuppressed] = useState(false);
    const isDetailOpen = urlDetailOpen && !detailSuppressed;

    // detail=1이 URL에 다시 생기면(다른 프로필 클릭 등) suppressed 해제
    useEffect(() => {
        if (urlDetailOpen) setDetailSuppressed(false);
    }, [urlDetailOpen]);
    // URL 파라미터 'view'의 값으로 첫 렌더링 시 뷰 모드를 설정하여
    // 클라이언트 사이드 렌더링 시 발생하는 화면 깜빡임(flicker) 방지
    const [isCardView, setIsCardView] = useState(initialIsCardView);

    // 1.5xl(1440px) 이상에서 카드 뷰 컬럼 수 (1단/2단). hydration mismatch 방지를 위해 상수로 초기화 후 effect에서 복원
    const [cardColumns, setCardColumns] = useState<1 | 2>(2);

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('profileCardColumns') : null;
        if (stored === '1' || stored === '2') {
            setCardColumns(Number(stored) as 1 | 2);
        }
    }, []);

    const handleColumnsChange = useCallback((cols: 1 | 2) => {
        setCardColumns(cols);
        try {
            window.localStorage.setItem('profileCardColumns', String(cols));
        } catch {
            // localStorage 사용 불가 환경 무시
        }
    }, []);
    
    // members 페이지에서는 default 프로필을 useMemo로 캐싱 (profiles가 변경될 때만 재계산)
    // alumni 페이지에서는 null로, 특정 프로필이 선택되지 않은 상태
    const defaultProfile = useMemo(() => 
        profiles.find(p => p.yamlId === DEFAULT_MEMBER_PROFILE_YAML_ID), 
        [profiles]
    );
    
    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'list') setIsCardView(false);
        else if (view === 'card') setIsCardView(true);
    }, [searchParams]);
    
    const mobilePopupRef = useRef<HTMLDivElement>(null);
    const profileRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const router = useRouter();

    const closeDetailModal = useCallback(() => {
        setDetailSuppressed(true);
        document.body.style.overflow = 'auto';
        const params = new URLSearchParams(searchParams.toString());
        params.delete('detail');
        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        window.history.replaceState(null, '', nextUrl);
        router.replace(nextUrl, { scroll: false });
    }, [router, pathname, searchParams]);

    const isProfileSelected = useCallback((profile: ProfileData) => {
        if (!selectedCard || profile.id !== selectedCard.id) return false;
        return isDetailOpen || activeSlug != null || selectedCard.yamlId !== DEFAULT_MEMBER_PROFILE_YAML_ID;
    }, [selectedCard, isDetailOpen, activeSlug]);

    // console.log('ProfileCards rendered');
    
    // 카테고리 설정
    const categories = isAlumniPage ? [
        {title: 'PhD Alumni', type: 'phd'},
        {title: 'MS Alumni', type: 'ms'},
        {title: 'Researchers', type: 'researcher'},
        {title: 'Interns', type: 'intern'},
    ] : [
        {title: 'Faculty', type: 'faculty'},
        {title: 'PhD Students', type: 'phd'},
        {title: 'MS Students', type: 'ms'},
        // {title: 'Incoming PhD Students', type: 'iphd'},
        {title: 'Incoming MS Students', type: 'ims'},
        {title: 'Researchers', type: 'researcher'},
        {title: 'Interns', type: 'intern'},
    ];

    const handleViewChange = useCallback((newView: boolean) => {
        setIsCardView(newView);
        setSelectedCard(isAlumniPage ? null : (defaultProfile || null));

        const url = newView ? `${profileBasePath}/` : `${profileBasePath}/?view=list`;
        router.replace(url, { scroll: false });
    }, [router, profileBasePath, defaultProfile, isAlumniPage]);

    const handleProfileClick = useCallback((profile: ProfileData) => {
        setDetailSuppressed(false);
        setSelectedCard(profile);
        const section = isAlumniPage ? 'alumni' : 'members';
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 880;
        const url = buildProfilePath(section, profile.id, {
            view: isCardView ? undefined : 'list',
            detail: isCardView && isMobile,
        });
        router.replace(url, { scroll: false });
    }, [router, isAlumniPage, isCardView]);

    // view가 바뀔때 이전에 클릭했던 프로필을 초기화
    useEffect(() => {
        setSelectedCard(selectedProfile || null);
    }, [selectedProfile]);

    // 자동 스크롤 -> 초기 진입 후 UI 로딩이 완료되기 전에 이동하면서 화면이 불안정함
    // useEffect(() => {
    //     if (selectedCard && (isDetailOpen || activeSlug != null || selectedCard.yamlId !== DEFAULT_MEMBER_PROFILE_YAML_ID)) {
    //         const profileElement = profileRefs.current[selectedCard.id];
    //         if (profileElement) {
    //             profileElement.scrollIntoView({
    //                 behavior: 'smooth',
    //                 block: (!isCardView && window.innerWidth < 768) ? 'start' : 'center'
    //             });
    //         }
    //     }
    // }, [selectedCard, isCardView, isDetailOpen, activeSlug]);
    // 자동 스크롤 (지연 200ms) -> 초기 진입 후 UI 로딩이 완료되기 전에 이동하면서 화면이 불안정함. 따라서서 시간을 버는 용도...
    useEffect(() => {
        if (selectedCard && (isDetailOpen || activeSlug != null || selectedCard.yamlId !== DEFAULT_MEMBER_PROFILE_YAML_ID)) {
            const timer = setTimeout(() => {
                const profileElement = profileRefs.current[selectedCard.id];
                if (profileElement) {
                    profileElement.scrollIntoView({
                        behavior: 'smooth',
                        block: (!isCardView && window.innerWidth < 768) ? 'start' : 'center'
                    });
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [selectedCard, isCardView, isDetailOpen, activeSlug]);

    const checkBottom = useCallback(() => {
        if (mobilePopupRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = mobilePopupRef.current;
            const atBottom = scrollHeight - scrollTop <= clientHeight + 10;
            setIsAtBottom(atBottom);
        }
    }, []);

    const handleScroll = () => {
        checkBottom();
    };

    // 현재 선택된 프로필과 관련된 스터디 필터링
    const selectedProfileStudies = useMemo(() => 
        selectedCard ? filterStudiesForProfile(studies, selectedCard) : [],
        [studies, selectedCard]
    );

    // 현재 선택된 프로필과 관련된 논문 필터링  
    const selectedProfilePapers = useMemo(() => 
        selectedCard ? getPapersForProfile(papers, selectedCard.yamlId) : [],
        [papers, selectedCard]
    );

    const selectedProfilePatents = useMemo(() => 
        selectedCard ? getPatentsForProfile(patents, selectedCard.yamlId) : [],
        [patents, selectedCard]
    );

    // 배경 스크롤 방지 및 ESC 키 처리
    useEffect(() => {
        if (isDetailOpen && selectedCard && window.innerWidth < 880 && isCardView) {
            document.body.style.overflow = 'hidden';

            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    closeDetailModal();
                }
            };
            document.addEventListener('keydown', handleEsc);

            return () => {
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEsc);
            };
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isDetailOpen, selectedCard, isCardView, closeDetailModal]);

    // 컴포넌트 마운트 시 스크롤 상태 확인 및 윈도우 리사이즈 감지
    useEffect(() => {
        const timer = setTimeout(checkBottom, 100);
        
        // 윈도우 리사이즈 이벤트 리스너 추가
        const handleResize = () => {
            checkBottom();
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [selectedCard, checkBottom]);

    // 배경 클릭으로 모달 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeDetailModal();
        }
    };

    return (
        <div className="max-w-screen-1.5xl mx-auto px-3 sm:px-4 py-8 md:py-12 flex flex-row relative min-w-0 1.5md:gap-12 lg:gap-20">
            {/* View Toggle Button */}
            <div className="absolute top-8 md:top-12 right-4 z-10 flex items-center gap-2">
                {/* Column Toggle (1.5xl 이상, Card View일 때만) */}
                {isCardView && (
                    <div className="hidden 1.5xl:flex bg-white border border-gray-300 rounded-lg p-1">
                        {/* 1 Column Button */}
                        <button
                            onClick={() => handleColumnsChange(1)}
                            className={`flex items-center px-2.5 py-2 rounded-l-md transition-all duration-200 ${
                                cardColumns === 1
                                    ? 'bg-interactive-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="1 Column"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="5" y="4" width="14" height="16" rx="1.5" strokeWidth={2} />
                            </svg>
                        </button>

                        {/* 2 Column Button */}
                        <button
                            onClick={() => handleColumnsChange(2)}
                            className={`flex items-center px-2.5 py-2 rounded-r-md transition-all duration-200 ${
                                cardColumns === 2
                                    ? 'bg-interactive-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="2 Columns"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="7.5" height="16" rx="1.5" strokeWidth={2} />
                                <rect x="13.5" y="4" width="7.5" height="16" rx="1.5" strokeWidth={2} />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="bg-white border border-gray-300 rounded-lg p-1 flex">
                    {/* Card View Button */}
                    <button
                        onClick={() => handleViewChange(true)}
                        className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-l-md transition-all duration-200 ${
                            isCardView 
                                ? 'bg-interactive-primary text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Card View"
                    >
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm font-medium">Card View</span>
                    </button>
                    
                    {/* List View Button */}
                    <button
                        onClick={() => handleViewChange(false)}
                        className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-r-md transition-all duration-200 ${
                            !isCardView 
                                ? 'bg-interactive-primary text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="List View"
                    >
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="text-sm font-medium">List View</span>
                    </button>
                </div>
            </div>

            {/* Detailed Profile (left side) - Card View에서만 표시 */}
            {selectedCard && isCardView && (
                <div className={`hidden 1.5md:block sticky self-start top-16 pt-4 min-w-0 1.5md:flex-1 1.5md:basis-0 ${cardColumns === 2 ? '1.5xl:flex-none 1.5xl:w-[350px]' : '1.5xl:flex-1 1.5xl:basis-0'}`}>
                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto pr-8 -mr-8 pb-20">
                        <ProfileCardDetail {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers} patents={selectedProfilePatents} projects={projects} isAlumniPage={isAlumniPage}/>
                    </div>
                </div>
            )}

            {/* Detailed Profile (popup) - ?detail=1 일 때만 모바일에서 팝업 표시 */}
            {selectedCard && isCardView && isDetailOpen && (
                <div
                    onClick={handleBackdropClick}
                    className="fixed inset-0 z-modal bg-black bg-opacity-75 flex items-center justify-center px-2 py-2 md:p-4 1.5md:hidden"
                >
                    <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-lg overflow-hidden relative">
                        {/* 닫기버튼 */}
                        <button
                            onClick={closeDetailModal}
                            className="absolute top-2 right-2 md:top-3 md:right-3 z-modal-controls"
                        >
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </button>

                        {/* 콘텐츠 (주소창 고려해서 -20px) */}
                        <div 
                            ref={mobilePopupRef}
                            className="overflow-y-auto w-full max-h-[calc(95vh-20px)] relative overscroll-none scrollbar-hide pt-2 pb-10" 
                            onScroll={handleScroll}
                        >
                            <ProfileCardDetail {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers} patents={selectedProfilePatents} projects={projects} isAlumniPage={isAlumniPage} isModal />
                        </div>

                        {/* 스크롤 인디케이터 - 모달 전체 하단에 고정 */}
                        <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ease-in-out ${
                            !isAtBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}>
                            <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-white/95 via-white/60 to-white/0 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 md:h-10 bg-gradient-to-t from-white/100 via-white/80 to-transparent pointer-events-none"></div>
                            <div className={`absolute bottom-1.5 md:bottom-2 left-0 right-0 flex justify-center items-center pointer-events-none transform transition-all duration-300 ease-in-out ${
                                !isAtBottom ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
                            }`}>
                                <svg
                                    className="h-5 md:h-6 text-interactive-primary animate-bounce"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2 9l10 10 10-10" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile List */}
            <div className={`flex-1 min-w-0 ${isCardView ? '1.5md:min-w-[430px]' : ''} ${isCardView && selectedCard ? '1.5md:flex-1 1.5md:basis-0' : ''} ${isCardView && selectedCard && cardColumns === 1 ? '1.5xl:flex-none 1.5xl:w-[550px]' : isCardView && selectedCard ? '1.5xl:flex-1 1.5xl:basis-0' : ''}`}>
                {categories.map((category) => {
                    const categoryProfiles = profiles.filter(profile => profile.type === category.type);
                    
                    // 해당 카테고리에 프로필이 없으면 렌더링하지 않음
                    if (categoryProfiles.length === 0) {
                        return null;
                    }
                    
                    return (
                        <div key={category.type}>
                            <div>
                                <h2 className="font-medium tracking-tight text-[26px] md:text-[30px]">{category.title}</h2>
                                <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>
                            </div>
                            
                            {isCardView ? (
                                // Card View
                                <div className={`grid grid-cols-1 ${cardColumns === 2 ? '1.5xl:grid-cols-[repeat(2,minmax(430px,1fr))]' : ''} gap-x-4 gap-y-3 sm:gap-y-4 mb-10`}>
                                    {categoryProfiles.map((profile, index) => (
                                        <div
                                            key={index}
                                            ref={el => { profileRefs.current[profile.id] = el; }}
                                        >
                                            <ProfileCardItem
                                                onClick={() => handleProfileClick(profile)}
                                                isSelected={isProfileSelected(profile)}
                                                isAlumniPage={isAlumniPage}
                                                {...profile}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // List View
                                <div className="pb-5 md:pb-10">
                                    {categoryProfiles.map((profile, index) => (
                                        <div
                                            key={index}
                                            ref={el => { profileRefs.current[profile.id] = el; }}
                                            className="scroll-mt-20"
                                        >
                                            <ProfileListItem
                                                onClick={() => handleProfileClick(profile)}
                                                isSelected={isProfileSelected(profile)}
                                                isAlumniPage={isAlumniPage}
                                                studies={studies}
                                                papers={papers}
                                                patents={patents}
                                                projects={projects}
                                                {...profile}
                                            />
                                            {/* Clean Divider - except for last item */}
                                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-5 md:my-10"></div>
                                            {/* {index < categoryProfiles.length - 1 && (
                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8"></div>
                                            )} */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                {/* Sticky positioning을 위한 하단 여백 */}
                {isCardView && selectedCard && <div className="h-[50vh]"></div>}
            </div>
        </div>
    );
}
