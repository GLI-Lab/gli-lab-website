"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProfileCardItem } from './ProfileCardItem';
import { ProfileListItem } from './ProfileListItem';
import { ProfileCardDetail } from './ProfileCardDetail';
import { type ProfileData, type PaperData, type StudyData } from '@/data/loaders/types';
import { getPapersForProfile } from '@/data/loaders/utils';

interface ProfileCardsProps {
    profiles: ProfileData[];
    selectedProfile?: ProfileData | null; // page에서 찾아서 넘겨준 프로필 (alumni 페이지에서는 null일 수 있음)
    studies?: StudyData[];
    papers?: PaperData[];
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
                return id === profile.id;
            }
        })
    );
};

export function ProfileCards({ profiles, selectedProfile, studies = [], papers = [], isAlumniPage = false, initialIsCardView = true }: ProfileCardsProps) {
    const [init, setInit] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileData | null>(selectedProfile || null);
    
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // URL 파라미터 'view'의 값으로 첫 렌더링 시 뷰 모드를 설정하여
    // 클라이언트 사이드 렌더링 시 발생하는 화면 깜빡임(flicker) 방지
    const [isCardView, setIsCardView] = useState(initialIsCardView);
    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'list') setIsCardView(false);
        else if (view === 'card') setIsCardView(true);
    }, [searchParams]);
    
    const mobilePopupRef = useRef<HTMLDivElement>(null);
    const profileRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const router = useRouter();

    console.log('ProfileCards rendered');
    
    // 카테고리 설정
    const categories = isAlumniPage ? [
        {title: 'Ph.D.', type: 'phd'},
        {title: 'M.S.', type: 'ms'},
        {title: 'Researchers', type: 'researcher'},
        {title: 'Interns', type: 'intern'},
    ] : [
        {title: 'Faculty', type: 'faculty'},
        {title: 'Ph.D. Students', type: 'phd'},
        {title: 'M.S. Students', type: 'ms'},
        // {title: 'Prospective Ph.D. Students', type: 'pphd'},
        // {title: 'Prospective M.S. Students', type: 'pms'},
        {title: 'Researchers', type: 'researcher'},
        {title: 'Interns', type: 'intern'},
    ];

    const handleViewChange = useCallback((newView: boolean) => {
        setIsCardView(newView);
        setInit(true); // 뷰 변경 시 init을 true로 설정
        setSelectedCard(null);

        // 특정 프로필 anchoring을 막기 위해 id 파라미터 제거
        // 즉, id 파라미터를 제거하니깐 selectedCard를 초기화하여 detailed에 표시되는 정보도 초기화를 해야함
        // -> 이걸 수행하는 함수가 아래아래 useEffect에 있음
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');  
        params.set('view', newView ? 'card' : 'list');
        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        router.replace(url, { scroll: false });  // 현재 프로필 클릭 시 스크롤 유지
    }, [pathname, router, searchParams]);

    const handleProfileClick = useCallback((profile: ProfileData) => {
        setInit(false);
        setSelectedCard(profile);
        const params = new URLSearchParams(searchParams.toString());
        params.set('id', profile.id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });  // 현재 프로필 클릭 시 스크롤 유지

    }, [selectedCard, router, pathname, searchParams]);

    // view가 바뀔때 이전에 클릭했던 프로필을 초기화
    useEffect(() => {
        setSelectedCard(selectedProfile || null);
    }, [selectedProfile]);

    // 초기 마운트 시 자동 스크롤
    useEffect(() => {
        // prevent moving when view type changed
        // init이 true이거나 selectedCard가 null이면 자동 스크롤하지 않음
        // 이는 뷰 변경 시나 초기 로딩 시 자동 스크롤을 방지하기 위함
        if (selectedProfile && !init && selectedCard && selectedProfile.id === selectedCard.id) {
            const timer = setTimeout(() => {
                const profileElement = profileRefs.current[selectedProfile.id];
                if (profileElement) {
                    profileElement.scrollIntoView({
                        behavior: 'smooth',
                        block: (!isCardView && window.innerWidth < 768) ? 'start' : 'center'
                    });
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [selectedProfile, selectedCard, isCardView, init]);

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
        selectedCard ? getPapersForProfile(papers, selectedCard.id) : [],
        [papers, selectedCard]
    );

    // 배경 스크롤 방지 및 ESC 키 처리
    useEffect(() => {
        if (!init && selectedCard && window.innerWidth < 880 && isCardView) {
            // 모달이 열릴 때 배경 스크롤 방지
            document.body.style.overflow = 'hidden';
            
            // ESC 키로 모달 닫기
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setSelectedCard(null);
                    document.body.style.overflow = 'auto';
                }
            };
            document.addEventListener('keydown', handleEsc);
            
            return () => {
                // 모달이 닫힐 때 스크롤 복원
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEsc);
            };
        } else {
            // 모달이 열리지 않은 경우 스크롤 복원
            document.body.style.overflow = 'auto';
        }
    }, [init, selectedCard, isCardView]);

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
            setSelectedCard(null);
            document.body.style.overflow = 'auto';
        }
    };

    return (
        <div className="max-w-screen-1.5xl mx-auto px-3 sm:px-4 py-8 md:py-12 flex flex-row relative">
            {/* View Toggle Button */}
            <div className="absolute top-8 md:top-12 right-4 z-10">
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
                <div className="hidden 1.5md:block 1.5md:w-[350px] 1.5md:mr-12 lg:mr-20 sticky self-start top-16 pt-4">
                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto pr-8 -mr-8 pb-20">
                        <ProfileCardDetail {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers} isAlumniPage={isAlumniPage}/>
                    </div>
                </div>
            )}

            {/* Detailed Profile (popup) - URL로 접근한 경우 모바일에서는 바로 열지 않음 -> {selectedCard && !init && (  */}
            {/* Detailed Profile (popup) - 모바일에서 팝업으로 표시                    -> {selectedCard && (           */}
            {selectedCard && isCardView && !init && (
                <div onClick={handleBackdropClick} className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center 1.5md:hidden">
                    <div className="max-h-[90vh] w-[90vw] max-w-[350px] flex flex-col items-center justify-center rounded-lg bg-white relative overflow-hidden">
                        {/* 닫기버튼 */}
                        <button
                            onClick={() => {
                                setSelectedCard(null);
                                document.body.style.overflow = 'auto';
                            }}
                            className="absolute top-1 right-1 z-[200]"
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
                            className="overflow-y-auto w-[320px] max-h-[calc(90vh-20px)] relative overscroll-none scrollbar-hide pt-2 pb-10" 
                            onScroll={handleScroll}
                        >
                            <ProfileCardDetail {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers} isAlumniPage={isAlumniPage}/>
                        </div>

                        {/* 스크롤 인디케이터 - 모달 전체 하단에 고정 */}
                        <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ease-in-out ${
                            !isAtBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}>
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/95 via-white/60 to-white/0 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/100 via-white/80 to-transparent pointer-events-none"></div>
                            <div className={`absolute bottom-1.5 left-0 right-0 flex justify-center items-center pointer-events-none transform transition-all duration-300 ease-in-out ${
                                !isAtBottom ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
                            }`}>
                                <svg
                                    className="h-5 text-interactive-primary animate-bounce"
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
            <div className="flex-1">
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
                                <div className="grid grid-cols-1 1.5xl:grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4 mb-10">
                                    {categoryProfiles.map((profile, index) => (
                                        <div
                                            key={index}
                                            ref={el => { profileRefs.current[profile.id] = el; }}
                                        >
                                            <ProfileCardItem
                                                onClick={() => handleProfileClick(profile)}
                                                isSelected={!!(selectedCard && profile.id === selectedCard.id && (!init || (selectedProfile && selectedProfile.id !== "[2024.03] 오병국")))}
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
                                                isSelected={!!(selectedCard && profile.id === selectedCard.id && (!init || (selectedProfile && selectedProfile.id !== "[2024.03] 오병국")))}
                                                isAlumniPage={isAlumniPage}
                                                studies={studies}
                                                papers={papers}
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
