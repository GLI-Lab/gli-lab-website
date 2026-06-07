"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProfileCardItem } from './ProfileCardItem';
import { ProfileListItem } from './ProfileListItem';
import { ProfileCardDetail } from './ProfileCardDetail';
import { type ProfileData, type PaperData, type StudyData, type PatentData, type ProjectData } from '@/data/loaders/types';
import { getPapersForProfile, getPatentsForProfile } from '@/data/loaders/utils';
import { buildProfilePath, DEFAULT_MEMBER_PROFILE_YAML_ID, findProfileById, getProfileSectionBasePath, getProfileSlugFromPathname, PROFILE_MOBILE_BREAKPOINT, type ProfileSection } from '@/lib/profileSlug';
import { preloadProfileModalPhoto } from '@/lib/preloadImages';

// SelectedItem / selectedCard  : 선택항목 A. 클릭하자마자 B로 바뀜
// pendingItem / pendingProfile : 클릭항목 B. 이동이 끝나면 null로 바뀜
// replaceState()               : Router.replace응답 받기 전, 주소창을 B로 바꿈
// usePathname() + activeSlug   : Next.js 클라이언트 라우터가 “이미 반영했다”고 보는 pathname. 
//                                Router.replace응답 받기 전, 선택항목 A
//                                Router.replace응답 받은 후, 클릭항목 B

// selected = 지금 UI에 쓰는 선택(B로 즉시 변경)
// pending = “URL이 아직 A인 동안 B를 지켜라” → replaceState로 주소창만 앞서게 함 -> activeSlug(router.replace응답완료)가 B가 되면 null
// open = router.replace 응답이 빠르거나 scroll 완료/timeout인 경우 모달 오픈

// // ─────────────────────────────────────────────────────────────────────────
// 다른 카드 선택
//   + 즉시 주소창 변경 (replaceState())
//   + 즉시 router.replace 요청 (주소창이 변경되는건 아니기 때문에 replaceState가 필요)
//   + 즉시 photo 전체 preload
//   + 즉시 클릭항목으로 스크롤 (profileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });)
//   + 이전 URL 반영을 방어 (isUrlStale)

// 모달 오픈 (isDetailOpen = (urlDetailOpen || detailPending) && !detailSuppressed) =
//   scroll 완료 (scrollend 또는 600ms)
//     → detailPending=true → 모달 바로 오픈 (router.replace응답/preloading 상관없이, “방금 클릭해서 모달 열어야 함”)
//   OR router가 scroll보다 먼저 완료 (urlDetailOpen=true)

// 모달 닫기 (!(urlDetailOpen || detailPending) 또는 detailSuppressed === true) =
//   router가 detail=1을 주지않고(urlDetailOpen) detailPending이 false인 경우
//   OR 사용자가 직접 모달을 닫아서 (detailSuppressed = true)가 되는 경우
// // ─────────────────────────────────────────────────────────────────────────

/** scrollend 미지원·이미 뷰포트 내일 때 smooth scroll 완료 대기 */
const SCROLL_WAIT_FALLBACK_MS = 600;

interface ProfileCardsProps {
    profiles: ProfileData[];
    studies?: StudyData[];
    papers?: PaperData[];
    patents?: PatentData[];
    projects?: ProjectData[];
    isAlumniPage?: boolean;
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

/** URL slug 또는 members 기본 교수로 첫 렌더 선택 프로필 결정 (useEffect 전 패널 깜빡임 방지) */
function resolveInitialSelected(
    profiles: ProfileData[],
    pathname: string,
    section: ProfileSection,
    isAlumniPage: boolean,
): ProfileData | null {
    const slug = getProfileSlugFromPathname(pathname, section);
    if (slug) return findProfileById(profiles, slug) ?? null;
    if (!isAlumniPage) {
        return profiles.find((p) => p.yamlId === DEFAULT_MEMBER_PROFILE_YAML_ID) ?? profiles[0] ?? null;
    }
    return null;
}

export function ProfileCards({ profiles, studies = [], papers = [], patents = [], projects = [], isAlumniPage = false }: ProfileCardsProps) {
    const profileSection: ProfileSection = isAlumniPage ? 'alumni' : 'members';
    const profileBasePath = getProfileSectionBasePath(profileSection);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileData | null>(() =>
        resolveInitialSelected(profiles, pathname, profileSection, isAlumniPage)
    );
    const [panelCard, setPanelCard] = useState<ProfileData | null>(() => {
        if (searchParams.get('view') === 'list') return null;
        return resolveInitialSelected(profiles, pathname, profileSection, isAlumniPage);
    });

    const urlDetailOpen = searchParams.get('detail') === '1';
    const [detailPending, setDetailPending] = useState(false);
    const [detailSuppressed, setDetailSuppressed] = useState(false);
    const isDetailOpen = (urlDetailOpen || detailPending) && !detailSuppressed;

    const modalOpenGenerationRef = useRef(0);
    /** 클릭 직후 pathname(activeSlug)이 따라잡기 전까지 이전 URL slug 무시 */
    const [pendingProfile, setPendingProfile] = useState<string | null>(null);

    const activeSlug = useMemo(
        () => getProfileSlugFromPathname(pathname, profileSection),
        [pathname, profileSection]
    );
    const isUrlStale = pendingProfile != null && activeSlug !== pendingProfile;

    const [isCardView, setIsCardView] = useState(() => searchParams.get('view') !== 'list');
    const [cardColumns, setCardColumns] = useState<1 | 2>(() =>
        searchParams.get('cols') === '1' ? 1 : 2
    );

    const handleColumnsChange = useCallback((cols: 1 | 2) => {
        setCardColumns(cols);
        const params = new URLSearchParams(searchParams.toString());
        if (cols === 1) {
            params.set('cols', '1');
        } else {
            params.delete('cols');
        }
        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [router, pathname, searchParams]);
    
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

    useEffect(() => {
        setCardColumns(searchParams.get('cols') === '1' ? 1 : 2);
    }, [searchParams]);
    
    const mobilePopupRef = useRef<HTMLDivElement>(null);
    const profileRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const lastScrolledIdRef = useRef<string | null>(null);

    const scrollToProfile = useCallback((profileId: string) => {
        lastScrolledIdRef.current = profileId;
        profileRefs.current[profileId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const scrollToProfileThen = useCallback((profileId: string, generation: number, onDone: () => void) => {
        lastScrolledIdRef.current = profileId;
        const element = profileRefs.current[profileId];

        const finish = () => {
            if (modalOpenGenerationRef.current !== generation) return;
            onDone();
        };

        if (!element) {
            finish();
            return;
        }

        let settled = false;
        const complete = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(fallback);
            window.removeEventListener('scrollend', onScrollEnd);
            finish();
        };

        const onScrollEnd = () => complete();
        const fallback = window.setTimeout(complete, SCROLL_WAIT_FALLBACK_MS);

        window.addEventListener('scrollend', onScrollEnd, { once: true });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const cancelPendingOpen = useCallback(() => {
        modalOpenGenerationRef.current += 1;
        setDetailPending(false);
        setPendingProfile(null);
    }, []);

    useEffect(() => {
        if (urlDetailOpen) {
            setDetailSuppressed(false);
            setDetailPending(false);
        }
    }, [urlDetailOpen]);

    const closeDetailModal = useCallback(() => {
        cancelPendingOpen();
        setDetailSuppressed(true);
        document.body.style.overflow = 'auto';
        const params = new URLSearchParams(searchParams.toString());
        params.delete('detail');
        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        window.history.replaceState(null, '', nextUrl);
        router.replace(nextUrl, { scroll: false });
    }, [router, pathname, searchParams, cancelPendingOpen]);

    const isProfileSelected = useCallback((profile: ProfileData) => {
        if (!selectedCard || profile.id !== selectedCard.id) return false;
        if (pendingProfile) return true;
        return isDetailOpen || detailPending || activeSlug != null || selectedCard.yamlId !== DEFAULT_MEMBER_PROFILE_YAML_ID;
    }, [selectedCard, isDetailOpen, detailPending, pendingProfile, activeSlug]);

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
        cancelPendingOpen();

        const section = isAlumniPage ? 'alumni' : 'members';
        const isMobile = typeof window !== 'undefined' && window.innerWidth < PROFILE_MOBILE_BREAKPOINT;

        if (isMobile) {
            setPendingProfile(null);
            setDetailSuppressed(true);
            setSelectedCard(isAlumniPage ? null : (defaultProfile || null));

            const params = new URLSearchParams();
            if (!newView) params.set('view', 'list');
            if (newView && cardColumns === 1) params.set('cols', '1');
            const query = params.toString();
            router.replace(query ? `${profileBasePath}/?${query}` : `${profileBasePath}/`, { scroll: false });
            return;
        }

        const profile = selectedCard ?? (isAlumniPage ? null : defaultProfile);

        const keepProfileInUrl =
            profile != null &&
            (activeSlug != null || profile.yamlId !== DEFAULT_MEMBER_PROFILE_YAML_ID || isAlumniPage);

        if (keepProfileInUrl) {
            const url = buildProfilePath(section, profile.id, {
                view: newView ? undefined : 'list',
                cols: newView && cardColumns === 1 ? 1 : undefined,
            });
            router.replace(url, { scroll: false });
            return;
        }

        const params = new URLSearchParams();
        if (!newView) params.set('view', 'list');
        if (newView && cardColumns === 1) params.set('cols', '1');
        const query = params.toString();
        router.replace(query ? `${profileBasePath}/?${query}` : `${profileBasePath}/`, { scroll: false });
    }, [router, profileBasePath, defaultProfile, isAlumniPage, cardColumns, selectedCard, activeSlug, cancelPendingOpen]);

    const handleProfileClick = useCallback((profile: ProfileData) => {
        const generation = ++modalOpenGenerationRef.current;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < PROFILE_MOBILE_BREAKPOINT;
        const isMobileCardModal = isCardView && isMobile;
        const isDesktopCardPanel = isCardView && !isMobile;

        setDetailSuppressed(false);
        setSelectedCard(profile);
        setPendingProfile(profile.id);
        setDetailPending(false);

        void preloadProfileModalPhoto(profile);

        const url = buildProfilePath(profileSection, profile.id, {
            view: isCardView ? undefined : 'list',
            detail: isMobileCardModal,
            cols: isCardView && cardColumns === 1 ? 1 : undefined,
        });

        window.history.replaceState(null, '', url);
        router.replace(url, { scroll: false });

        scrollToProfileThen(profile.id, generation, () => {
            if (isMobileCardModal) setDetailPending(true);
            if (isDesktopCardPanel) setPanelCard(profile);
        });
    }, [router, profileSection, isCardView, cardColumns, scrollToProfileThen]);

    // pathname(activeSlug)가 클릭 대상과 일치하면 pending 해제
    useEffect(() => {
        if (!pendingProfile || activeSlug !== pendingProfile) return;
        setPendingProfile(null);
    }, [activeSlug, pendingProfile]);

    // layout 유지 시 page가 갱신되지 않아도 URL slug로 selectedCard 동기화
    // detailPending·stale slug 동안: 클릭한 프로필 유지
    useEffect(() => {
        if (detailPending || isUrlStale) return;

        if (!activeSlug) {
            if (!urlDetailOpen) {
                const fallback = !isAlumniPage ? (defaultProfile ?? null) : null;
                setSelectedCard(fallback);
            }
            return;
        }

        const match = findProfileById(profiles, activeSlug);
        if (match) setSelectedCard(match);
    }, [activeSlug, profiles, urlDetailOpen, detailPending, isUrlStale, isAlumniPage, defaultProfile]);

    // 외부 URL 진입·뒤로가기 시 데스크톱 패널 동기화
    useEffect(() => {
        if (detailPending || isUrlStale || pendingProfile) return;
        if (!isCardView) {
            setPanelCard(null);
            return;
        }
        if (!selectedCard) {
            setPanelCard(null);
            return;
        }
        setPanelCard((prev) => (prev?.id === selectedCard.id ? prev : selectedCard));
    }, [selectedCard, detailPending, isUrlStale, pendingProfile, isCardView]);

    useEffect(() => {
        if (pendingProfile) return;
        if (!activeSlug) lastScrolledIdRef.current = null;
    }, [activeSlug, pendingProfile]);

    // 외부 URL 진입·뒤로가기 시 스크롤 (페이지 내 클릭은 handleProfileClick에서 처리)
    useEffect(() => {
        if (detailPending || pendingProfile) return;
        if (!selectedCard || activeSlug !== selectedCard.id) return;
        if (lastScrolledIdRef.current === selectedCard.id) return;

        scrollToProfile(selectedCard.id);
    }, [selectedCard, activeSlug, detailPending, pendingProfile, scrollToProfile]);

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

    const selectedProfileStudies = useMemo(() => 
        selectedCard ? filterStudiesForProfile(studies, selectedCard) : [],
        [studies, selectedCard]
    );

    const selectedProfilePapers = useMemo(() => 
        selectedCard ? getPapersForProfile(papers, selectedCard.yamlId) : [],
        [papers, selectedCard]
    );

    const selectedProfilePatents = useMemo(() => 
        selectedCard ? getPatentsForProfile(patents, selectedCard.yamlId) : [],
        [patents, selectedCard]
    );

    const panelProfileStudies = useMemo(() => 
        panelCard ? filterStudiesForProfile(studies, panelCard) : [],
        [studies, panelCard]
    );

    const panelProfilePapers = useMemo(() => 
        panelCard ? getPapersForProfile(papers, panelCard.yamlId) : [],
        [papers, panelCard]
    );

    const panelProfilePatents = useMemo(() => 
        panelCard ? getPatentsForProfile(patents, panelCard.yamlId) : [],
        [patents, panelCard]
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

    const viewToggleButtons = (
        <div className="flex items-center gap-2">
            {isCardView && (
                <div className="hidden 1.5xl:flex bg-white border border-gray-300 rounded-lg p-1 1.5md:shadow-sm">
                    <button
                        onClick={() => handleColumnsChange(1)}
                        className={`flex items-center px-2.5 py-2 rounded-l-md transition-all duration-200 ${
                            cardColumns === 1
                                ? 'bg-interactive-primary text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="1 column layout"
                        aria-label="1 column layout"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <rect x="5" y="4" width="14" height="16" rx="1.5" strokeWidth={2} />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleColumnsChange(2)}
                        className={`flex items-center px-2.5 py-2 rounded-r-md transition-all duration-200 ${
                            cardColumns === 2
                                ? 'bg-interactive-primary text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="2 column layout"
                        aria-label="2 column layout"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <rect x="3" y="4" width="7.5" height="16" rx="1.5" strokeWidth={2} />
                            <rect x="13.5" y="4" width="7.5" height="16" rx="1.5" strokeWidth={2} />
                        </svg>
                    </button>
                </div>
            )}
            <div className="bg-white border border-gray-300 rounded-lg p-1 flex 1.5md:shadow-sm">
                <button
                    onClick={() => handleViewChange(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-l-md transition-all duration-200 ${
                        isCardView
                            ? 'bg-interactive-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Card view"
                    aria-label="Card view"
                >
                    <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-medium">Card</span>
                </button>
                <button
                    onClick={() => handleViewChange(false)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-r-md transition-all duration-200 ${
                        !isCardView
                            ? 'bg-interactive-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="List view"
                    aria-label="List view"
                >
                    <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="text-sm font-medium">List</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-screen-1.5xl mx-auto px-3 sm:px-4 py-8 md:py-12">
            {/* 1.5md+ — Faculty title 높이에서 sticky (column 토글은 1.5xl+) */}
            <div className="hidden 1.5md:block z-10 h-0 overflow-visible sticky top-20">
                <div className="absolute right-4 top-0">
                    {viewToggleButtons}
                </div>
            </div>
            <div className="flex flex-row min-w-0 1.5md:gap-12 lg:gap-20">
            {/* Detailed Profile (left side) - Card View에서만 표시 */}
            {panelCard && isCardView && (
                <div className={`hidden 1.5md:block sticky self-start top-16 pt-4 min-w-0 1.5md:flex-1 1.5md:basis-0 ${cardColumns === 2 ? '1.5xl:flex-none 1.5xl:w-[350px]' : '1.5xl:flex-1 1.5xl:basis-0'}`}>
                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto pr-8 -mr-8 pb-20">
                        <ProfileCardDetail key={panelCard.id} {...panelCard} studies={panelProfileStudies} papers={panelProfilePapers} patents={panelProfilePatents} projects={projects} isAlumniPage={isAlumniPage}/>
                    </div>
                </div>
            )}

            {/* Detailed Profile (popup) - ?detail=1 일 때만 모바일에서 팝업 표시 */}
            {isDetailOpen && selectedCard && isCardView && (
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
                            <ProfileCardDetail key={selectedCard.id} {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers} patents={selectedProfilePatents} projects={projects} isAlumniPage={isAlumniPage} isModal />
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
            <div className={`flex-1 min-w-0 ${isCardView ? '1.5md:min-w-[430px]' : ''} ${isCardView && panelCard ? '1.5md:flex-1 1.5md:basis-0' : ''} ${isCardView && panelCard && cardColumns === 1 ? '1.5xl:flex-none 1.5xl:w-[550px]' : isCardView && panelCard ? '1.5xl:flex-1 1.5xl:basis-0' : ''}`}>
                {/* 1.5md 미만 — Faculty title 옆 (sticky 없음) */}
                <div className="1.5md:hidden relative z-10 h-0 overflow-visible">
                    <div className="absolute right-0 top-0">
                        {viewToggleButtons}
                    </div>
                </div>
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
                {isCardView && panelCard && <div className="h-[50vh]"></div>}
            </div>
            </div>
        </div>
    );
}
