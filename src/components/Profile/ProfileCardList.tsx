"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileItem } from './ProfileItem';
import { ProfileDetail } from './ProfileDetail';
import { type ProfileData, type PaperData, getPapersForProfile } from './profiles';
import { StudyData } from '../Study';

interface ProfileCardListProps {
    profiles: ProfileData[];
    selectedProfile: ProfileData; // page에서 찾아서 넘겨준 프로필
    studies?: StudyData[];
    papers?: PaperData[];
}

const defaultProfile: ProfileData = {
    id: "Unknown",
    type: "Unknown",
    title: "Unknown",
    name_en: "Unknown",
    name_ko: "Unknown",
    admission: "Unknown",
    bs: "Unknown",
    ms: "Unknown",
    phd: "Unknown",
    academic_year: null,
    academic_semester: null,
    joined: "Unknown",
    interest: "Unknown",
    current_work: [],
    photo: ["/images/profiles/ku_basic_1_down.png"],
    email: ["#"],
    homepage: "#",
    github: ["#"],
    linkedin: "#",
};

// 현재 프로필과 관련된 스터디를 필터링하는 함수
const filterStudiesForProfile = (allStudies: StudyData[], profile: ProfileData) => {
    return allStudies.filter(study => 
        study.participants.some(participant => {
            // <profile=[date] name>Full Name</> 형식 파싱
            const profileMatch = participant.match(/^<profile=(.+?)>(.+?)<\/>$/);
            if (profileMatch) {
                const [, id, displayName] = profileMatch;
                return displayName.includes(profile.name_ko) || displayName.includes(profile.name_en);
            }
            // 기존 형식 [date] name
            return participant.includes(profile.name_ko);
        })
    );
};

export const ProfileCardList: React.FC<ProfileCardListProps> = ({ profiles: rawProfiles, selectedProfile, studies = [], papers = [] }) => {
    const [init, setInit] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileData | null>(selectedProfile);
    const contentRef = useRef<HTMLDivElement>(null);
    const profileRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const router = useRouter();

    console.log('ProfileCardListClient rendered');
    
    const categories = [
        {title: 'Faculty', type: 'faculty'},
        {title: 'M.S. Students', type: 'ms'},
        {title: 'Prospective Ph.D. Students', type: 'pphd'},
        {title: 'Prospective M.S. Students', type: 'pms'},
        {title: 'Interns', type: 'intern'},
    ];

    const processedProfiles: ProfileData[] = useMemo(() => rawProfiles.map(profile => ({
        ...defaultProfile,
        ...profile,
        id: profile.id ?? defaultProfile.id,
        type: profile.type ?? defaultProfile.type,
        name_en: profile.name_en ?? defaultProfile.name_en,
        name_ko: profile.name_ko ?? defaultProfile.name_ko,
        admission: profile.admission ?? defaultProfile.admission,
        bs: profile.bs ?? defaultProfile.bs,
        ms: profile.ms ?? defaultProfile.ms,
        phd: profile.phd ?? defaultProfile.phd,
        academic_year: profile.academic_year ?? defaultProfile.academic_year,
        academic_semester: profile.academic_semester ?? defaultProfile.academic_semester,
        joined: profile.joined ?? defaultProfile.joined,
        interest: profile.interest ?? defaultProfile.interest,
        current_work: profile.current_work && profile.current_work.length > 0 ? profile.current_work : defaultProfile.current_work,
        photo: profile.photo && profile.photo.length > 0 ? profile.photo : defaultProfile.photo,
        email: profile.email && profile.email.length > 0 ? profile.email : defaultProfile.email,
        homepage: profile.homepage || defaultProfile.homepage,
        github: profile.github && profile.github.length > 0 ? profile.github : defaultProfile.github,
        linkedin: profile.linkedin || defaultProfile.linkedin,
    })), [rawProfiles]);

    const handleProfileClick = useCallback((profile: ProfileData) => {
        if (profile !== selectedCard) {
            setInit(false);
            setSelectedCard(profile);
            
            // URL 업데이트
            router.replace(`/people/members?id=${profile.id}`, { scroll: false });
        } else {
            setInit(false);
            setSelectedCard(profile);
        }
    }, [selectedCard, router]);

    // selectedProfile이 변경되면 selectedCard 업데이트
    useEffect(() => {
        setSelectedCard(selectedProfile);
    }, [selectedProfile]);

    // 초기 마운트 시 자동 스크롤
    useEffect(() => {
        const timer = setTimeout(() => {
            const profileElement = profileRefs.current[selectedProfile.id];
            if (profileElement) {
                profileElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 200);
        
        return () => clearTimeout(timer);
    }, []); // 빈 의존성 배열로 마운트 시에만 실행

    const checkBottom = useCallback(() => {
        if (contentRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = contentRef.current;
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
        if (!init && selectedCard && window.innerWidth < 880) {
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
    }, [init, selectedCard]);

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
        <div className="max-w-screen-1.5xl mx-auto px-3 sm:px-4 py-8 md:py-12 flex flex-row">
            {/* Detailed Profile (left side) */}
            {selectedCard && (
                <div className="hidden 1.5md:block w-[320px] 1.5md:w-[350px] 1.5md:mr-12 lg:mr-20 sticky self-start top-16 pt-4">
                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto pr-8 -mr-8 pb-20">
                        <ProfileDetail {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers}/>
                    </div>
                </div>
            )}

            {/* Detailed Profile (popup) - URL로 접근한 경우 모바일에서는 바로 열지 않음 */}
            {selectedCard && !init && (
                <div onClick={handleBackdropClick} className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center 1.5md:hidden">
                    <div className="max-h-[90vh] w-[360px] 1.5md:w-[400px] flex flex-col items-center justify-center rounded-lg bg-white relative overflow-hidden">
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

                        {/* 콘텐츠 (주소창 고려해서 -60px) */}
                        <div 
                            ref={contentRef}
                            className="overflow-y-auto w-[320px] 1.5md:w-[350px] max-h-[calc(90vh-60px)] relative overscroll-none scrollbar-hide pt-2 pb-10" 
                            onScroll={handleScroll}
                        >
                            <ProfileDetail {...selectedCard} studies={selectedProfileStudies} papers={selectedProfilePapers}/>
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
                {categories.map((category) => (
                    <div key={category.type}>
                        <div>
                            <h2 className="font-medium tracking-tight text-[26px] md:text-[30px]">{category.title}</h2>
                            <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>
                        </div>
                        <div className="grid grid-cols-1 1.5xl:grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4 mb-10">
                            {processedProfiles
                                .filter(profile => profile.type === category.type)
                                .map((profile, index) => (
                                    <div
                                        key={index}
                                        ref={el => { profileRefs.current[profile.id] = el; }}
                                    >
                                        <ProfileItem
                                            onClick={() => handleProfileClick(profile)}
                                            isSelected={!!(selectedCard && profile.id === selectedCard.id && (!init || selectedProfile.id !== "[2024.03] 오병국"))}
                                            {...profile}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 