"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProfileCardItem } from './ProfileCardItem';
import { ProfileListItem } from './ProfileListItem';
import { ProfileCardDetail } from './ProfileCardDetail';
import { type ProfileData, type PaperData, type StudyData, type PatentData, type ProjectData } from '@/data/loaders/types';
import { getPapersForProfile, getPatentsForProfile } from '@/data/loaders/utils';
import { buildProfilePath, DEFAULT_MEMBER_PROFILE_YAML_ID, getProfileSectionBasePath, getProfileSlugFromPathname, PROFILE_MOBILE_BREAKPOINT, type ProfileSection } from '@/lib/profileSlug';
import { preloadProfileModalPhoto, stopSmoothScroll } from '@/lib/preloadImages';

// 이전에는 URL을 바꾸고 요청을 보내서 받을때까지 모달이 띄워지지 않았음

//   → (대기) router.replace / RSC     ← 이 구간에 모달 DOM 없음 → 상세 이미지 요청 없음
//   → (대기) 배경 scrollIntoView      ← 카드 썸네일만 보일 수 있음
//   → 모달 마운트
//   → 그때서야 모달 이미지 fetch 시작

// 모달을 먼저 띄우고나서 URL을 바꾸는 방식은 아래와 같은 장점을 얻음
// # 장점: RSC 기다리는 시간에 이미지 fetch를 시작할 수 있음.
// # detailPending이 true면 urlDetailOpen이 아직 false여도 모달이 즉시 열립니다. URL은 router.replace로 뒤에서 맞춰집니다.

//   → 모달 즉시 마운트 → 이미지 fetch 시작  ─┐
//   → router.replace (백그라운드)            ├─ 동시에
//   → (나중) activeSlug 맞으면 스크롤       ─┘

// 문제는 그 다음에 다른 카드를 눌러서 모달이 띄워지면, router.replace가 먼저 실행되는게 아니라, 모달이 띄워지고나서 실행되니깐, 띄워진 모달은 이전 URL 영향을 받는다는 것

// 1. B 카드 클릭 → setSelectedItem(B) → detailPending=true → 모달 열림 (B여야 함)
// 2. 그런데 activeSlug는 아직 A (이전 URL)
// 3. useEffect: "URL slug로 selectedItem 맞춰라" → setSelectedItem(A)  ← 덮어씀!
// 4. 모달엔 잠깐 A 사진
// 5. router.replace 끝나면 activeSlug=B → 다시 B로 바뀜

// 일부 해결
// # 3번에서 이전 URL(A)로 덮어쓰지 않고, 5번에서 URL이 따라잡힌 뒤에만 다시 URL 기준 동기화를 켭니다.

// 1. B 카드 클릭 → setSelectedItem(B) → detailPending=true → 모달 열림 (B여야 함)
// 2. activeSlug는 아직 A (이전 URL) — router.replace는 아직 진행 중
// 3. useEffect: detailPending === true → return (동기화 스킵) → selectedItem은 B 유지
// 4. 모달엔 B 사진만 표시 (key={B.id}로 이전 모달 state도 리셋)
// 5. router.replace 완료 → activeSlug=B, urlDetailOpen=true
//    → detailPending=false
//    → useEffect 다시 실행 → activeSlug로 맞춤 → 이미 B라 변화 없음

// ⭐️드디어 해결⭐️

// # 다른 카드 선택 -> 즉시 router.replace 요청 (주소창이 변경되는건 아님)
//                     + 즉시 주소창 변경 (replaceState(url))
//                     + 즉시 다른 카드의 photo 전체 preload (photo[0]만 대기, 나머지는 백그라운드)
//                     + 즉시 스크롤 (profileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });)
// # 데스크탑도 selectedCard로 왼쪽 패널이 바로 갱신하지않고 대기
// # router.replace는 "서버에 RSC 요청 전송" -> "클라이언트가 응답 파싱" 할 때까지 URL이 안 바뀜
// # 다른 카드를 클릭하며 이전 URL이 여전히 남아있어서 slug를 읽어와서 영향을 받기때문에, 다른 카드 클릭하면 이전 URL을 읽지말고 영향을 받지 않기
// # photo[0] + router.replace 응답 받으면 모달 오픈 (대기 MAX 800ms timeout)

// 주소창 변경
//   window.history.replaceState(null, '', url);
// 이전 URL (주소창과 다름) 방어
//   pendingProfileId + isServerUrlStale  # 이전 URL을 읽지 말 것
// 모달 오픈 =
//   photo[0] preload 완료
//   AND clientSlug === pendingProfileId  # 모달을 열 때 “URL이 B로 바뀌었나?” 를 확인하는 조건
//   AND urlDetailOpen (?detail=1)
//   → stopSmoothScroll() 후 모달 오픈    # 800ms 지나면 preload 완료를 안 기다리고 모달을 엽니다.


const MAX_MODAL_OPEN_WAIT_MS = 800;

type RevealKind = 'modal' | 'panel';

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
    initialCardColumns?: 1 | 2; // SSR 단계에서 cols URL 파라미터 반영 (기본 2)
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

export function ProfileCards({ profiles, selectedProfile, activeSlug = null, studies = [], papers = [], patents = [], projects = [], isAlumniPage = false, initialIsCardView = true, initialCardColumns = 2 }: ProfileCardsProps) {
    const profileSection: ProfileSection = isAlumniPage ? 'alumni' : 'members';
    const profileBasePath = getProfileSectionBasePath(profileSection);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileData | null>(selectedProfile || null);
    /** 데스크톱 왼쪽 패널에 표시 중인 프로필 (클릭 즉시 갱신하지 않음) */
    const [panelCard, setPanelCard] = useState<ProfileData | null>(selectedProfile || null);
    
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    // 카드 클릭 공통: replaceState + router.replace + scroll + photo preload + pendingProfileId
    // revealPending: 카드 뷰에서 preload + router 준비 전까지 UI 갱신 대기
    //   - 'modal': 모바일 ?detail=1 모달 오픈 대기
    //   - 'panel': 데스크톱 왼쪽 패널(panelCard) 갱신 대기
    // - urlDetailOpen (?detail=1): 모바일 모달 source of truth
    // - isDetailOpen = urlDetailOpen && revealPending !== 'modal' && !detailSuppressed
    const urlDetailOpen = searchParams.get('detail') === '1';
    const [revealPending, setRevealPending] = useState<RevealKind | null>(null);
    const [detailSuppressed, setDetailSuppressed] = useState(false);
    const isDetailOpen = urlDetailOpen && revealPending !== 'modal' && !detailSuppressed;

    const modalOpenGenerationRef = useRef(0);
    const [preloadReady, setPreloadReady] = useState(false);
    /** 클릭 직후 서버 activeSlug가 따라잡기 전까지 이전 URL 무시 */
    const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);

    const clientSlug = useMemo(
        () => getProfileSlugFromPathname(pathname, profileSection),
        [pathname, profileSection]
    );
    const isServerUrlStale = pendingProfileId != null && activeSlug !== pendingProfileId;
    // URL 파라미터 'view'의 값으로 첫 렌더링 시 뷰 모드를 설정하여
    // 클라이언트 사이드 렌더링 시 발생하는 화면 깜빡임(flicker) 방지
    const [isCardView, setIsCardView] = useState(initialIsCardView);

    // 1.5xl(1440px) 이상 카드 뷰 컬럼 수. URL cols 파라미터로 SSR·공유·뒤로가기 일관성 유지 (기본 2)
    const [cardColumns, setCardColumns] = useState<1 | 2>(initialCardColumns);

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
        const profileElement = profileRefs.current[profileId];
        if (!profileElement) return;

        profileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const cancelPendingReveal = useCallback(() => {
        modalOpenGenerationRef.current += 1;
        setPreloadReady(false);
        setRevealPending(null);
    }, []);

    const closeDetailModal = useCallback(() => {
        cancelPendingReveal();
        setDetailSuppressed(true);
        document.body.style.overflow = 'auto';
        const params = new URLSearchParams(searchParams.toString());
        params.delete('detail');
        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        window.history.replaceState(null, '', nextUrl);
        router.replace(nextUrl, { scroll: false });
    }, [router, pathname, searchParams, cancelPendingReveal]);

    const isProfileSelected = useCallback((profile: ProfileData) => {
        if (!selectedCard || profile.id !== selectedCard.id) return false;
        // 네비게이션 중에는 클릭한 카드만 선택 (이전 activeSlug 무시)
        if (pendingProfileId) return true;
        return isDetailOpen || revealPending === 'modal' || activeSlug != null || selectedCard.yamlId !== DEFAULT_MEMBER_PROFILE_YAML_ID;
    }, [selectedCard, isDetailOpen, revealPending, pendingProfileId, activeSlug]);

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
        cancelPendingReveal();

        const section = isAlumniPage ? 'alumni' : 'members';
        const isMobile = typeof window !== 'undefined' && window.innerWidth < PROFILE_MOBILE_BREAKPOINT;

        if (isMobile) {
            setPendingProfileId(null);
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
    }, [router, profileBasePath, defaultProfile, isAlumniPage, cardColumns, selectedCard, activeSlug, cancelPendingReveal]);

    const handleProfileClick = useCallback((profile: ProfileData) => {
        setDetailSuppressed(false);
        setSelectedCard(profile);
        setPendingProfileId(profile.id);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < PROFILE_MOBILE_BREAKPOINT;
        const isMobileCardModal = isCardView && isMobile;
        const isDesktopCardPanel = isCardView && !isMobile;
        const needsAwaitedReveal = isMobileCardModal || isDesktopCardPanel;
        const url = buildProfilePath(profileSection, profile.id, {
            view: isCardView ? undefined : 'list',
            detail: isMobileCardModal,
            cols: isCardView && cardColumns === 1 ? 1 : undefined,
        });

        window.history.replaceState(null, '', url);
        scrollToProfile(profile.id);

        if (needsAwaitedReveal) {
            const generation = ++modalOpenGenerationRef.current;
            setRevealPending(isMobileCardModal ? 'modal' : 'panel');
            setPreloadReady(false);
            preloadProfileModalPhoto(profile).then(() => {
                if (modalOpenGenerationRef.current !== generation) return;
                setPreloadReady(true);
            });
        } else {
            void preloadProfileModalPhoto(profile);
        }

        router.replace(url, { scroll: false });
    }, [router, profileSection, isCardView, cardColumns, scrollToProfile]);

    // 서버 activeSlug가 클릭 대상과 일치하면 pending 해제
    useEffect(() => {
        if (!pendingProfileId || activeSlug !== pendingProfileId) return;
        setPendingProfileId(null);
    }, [activeSlug, pendingProfileId]);

    // preload + 클라이언트 URL 도착 시 reveal (모바일 모달 / 데스크톱 패널)
    useEffect(() => {
        if (!revealPending || !pendingProfileId || !preloadReady) return;
        if (clientSlug !== pendingProfileId) return;
        if (revealPending === 'modal' && !urlDetailOpen) return;

        stopSmoothScroll();
        if (revealPending === 'panel' && selectedCard) setPanelCard(selectedCard);
        setPreloadReady(false);
        setRevealPending(null);
    }, [revealPending, pendingProfileId, clientSlug, urlDetailOpen, preloadReady, selectedCard]);

    // 느린 네트워크 대비 최대 대기 후 강제 reveal
    useEffect(() => {
        if (!revealPending) return;

        const kind = revealPending;
        const timer = window.setTimeout(() => {
            console.warn(
                `[ProfileCards] reveal timeout (${MAX_MODAL_OPEN_WAIT_MS}ms) — preload/URL 미완료, 강제 reveal`,
                {
                    profileId: selectedCard?.id,
                    pendingProfileId,
                    revealPending: kind,
                    preloadReady,
                    clientSlug,
                    urlDetailOpen,
                }
            );
            stopSmoothScroll();
            if (kind === 'panel' && selectedCard) setPanelCard(selectedCard);
            setPreloadReady(false);
            setRevealPending(null);
        }, MAX_MODAL_OPEN_WAIT_MS);

        return () => window.clearTimeout(timer);
    }, [revealPending, pendingProfileId]);

    // URL slug(selectedProfile) 변경 시 선택 상태 동기화
    // pending 중(서버 URL stale) 또는 reveal 준비 중: 클릭한 프로필 유지
    useEffect(() => {
        if (isServerUrlStale || revealPending != null) return;
        if (!selectedProfile) {
            setSelectedCard(null);
            return;
        }
        setSelectedCard((prev) => (prev?.id === selectedProfile.id ? prev : selectedProfile));
    }, [selectedProfile, isServerUrlStale, revealPending]);

    // 외부 URL 진입·뒤로가기 시 데스크톱 패널 동기화 (reveal 대기 중이 아닐 때)
    useEffect(() => {
        if (revealPending != null || isServerUrlStale) return;
        if (!selectedCard) {
            setPanelCard(null);
            return;
        }
        setPanelCard((prev) => (prev?.id === selectedCard.id ? prev : selectedCard));
    }, [selectedCard, revealPending, isServerUrlStale]);

    useEffect(() => {
        if (pendingProfileId) return;
        if (!activeSlug) lastScrolledIdRef.current = null;
    }, [activeSlug, pendingProfileId]);

    // 자동 스크롤 — 외부 URL 진입·뒤로가기 (페이지 내 클릭은 handleProfileClick에서 처리)
    useEffect(() => {
        if (pendingProfileId || revealPending != null) return;
        if (!selectedCard || activeSlug !== selectedCard.id) return;
        if (lastScrolledIdRef.current === selectedCard.id) return;

        scrollToProfile(selectedCard.id);
    }, [selectedCard, activeSlug, pendingProfileId, revealPending, scrollToProfile]);

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
