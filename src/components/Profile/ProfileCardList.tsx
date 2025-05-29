"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ProfileItem } from './ProfileItem';
import { ProfileDetail } from './ProfileDetail';
import { type ProfileData } from './profiles';

interface ProfileCardListProps {
    profiles: ProfileData[];
    defaultSelected?: ProfileData;
}

const defaultProfile: ProfileData = {
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

export const ProfileCardList: React.FC<ProfileCardListProps> = ({ profiles: rawProfiles, defaultSelected }) => {
    const [init, setInit] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileData | null>(defaultSelected || null);
    const popupRef = useRef<HTMLDivElement>(null);

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
        } else {
            setInit(false);
            setSelectedCard(profile);
        }
    }, [selectedCard]);

    const updateCanScroll = useCallback(() => {
        const disableScroll = (e: Event) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                e.preventDefault();
            }
        };
        if (!init && selectedCard && window.innerWidth < 880) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('touchmove', disableScroll, {passive: false});
        } else {
            document.body.style.overflow = 'auto';
            document.removeEventListener('touchmove', disableScroll);
        }
    }, [init, selectedCard]);

    const checkBottom = useCallback(() => {
        if (popupRef.current) {
            const {scrollHeight, scrollTop, clientHeight} = popupRef.current;
            const atBottom = scrollHeight - scrollTop <= clientHeight + 20;
            setIsAtBottom(atBottom);
        }
    }, []);

    // 기본 선택 설정은 이제 불필요 (서버에서 미리 설정됨)
    // useEffect(() => {
    //     if (processedProfiles.length > 0 && !selectedCard) {
    //         setSelectedCard(processedProfiles.find(profile => profile.name_en === "Byungkook Oh") || processedProfiles[0]);
    //     }
    // }, [processedProfiles, selectedCard]);

    useEffect(() => {
        updateCanScroll();
        window.addEventListener('resize', updateCanScroll);
        window.addEventListener('resize', checkBottom);

        return () => {
            window.removeEventListener('resize', updateCanScroll);
            window.removeEventListener('resize', checkBottom);
        };
    }, [updateCanScroll, checkBottom]);

    useEffect(() => {
        checkBottom();
    }, [init, selectedCard, checkBottom]);

    return (
        <div className="max-w-screen-1.5xl mx-auto px-4 py-10 flex flex-row">
            {/* Detailed Profile (left side) */}
            {selectedCard && (
                <div className="hidden 1.5md:block 1.5md:pr-12 lg:pr-24 sticky self-start top-14">
                    <ProfileDetail {...selectedCard}/>
                </div>
            )}

            {/* Detailed Profile (popup) */}
            {selectedCard && !init && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-20 1.5md:hidden ">
                    <div className="fixed top-0 left-0 right-0 z-[150] px-6 pt-3 pb-24 max-h-screen flex justify-center">
                        <div className="w-[360px] 1.5md:w-[400px] max-h-screen pt-3 pb-0
                                       rounded-lg bg-white shadow-2xl border border-border-accent relative overflow-hidden"
                        >
                            <div ref={popupRef} className="h-full w-full overflow-x-hidden overflow-y-scroll"
                                onScroll={checkBottom}
                                >
                                <button
                                    className="absolute top-0 right-3 z-[200] text-5xl text-interactive-primary font-light"
                                    onClick={() => {
                                        setSelectedCard(null);
                                        document.body.style.overflow = 'auto';
                                    }}
                                >
                                    &times;
                                </button>
                                <div className="flex flex-col items-center justify-center pb-8">
                                    <ProfileDetail {...selectedCard}/>
                                </div>

                                {!isAtBottom && (
                                    <>
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center">
                                            <svg
                                                className="w-8 h-4 ml-2 text-interactive-primary animate-bounce"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2 9l10 10 10-10" />
                                            </svg>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile List */}
            <div className="flex-1 pt-4">
                {categories.map((category) => (
                    <div key={category.type}>
                        <div>
                            <h2 className="font-medium tracking-tight text-[26px] md:text-[30px]">{category.title}</h2>
                            <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>
                        </div>
                        <div className="grid grid-cols-1 1.5xl:grid-cols-2 gap-x-4 gap-y-4 1.5xl:gap-y-6 mb-10">
                            {processedProfiles
                                .filter(profile => profile.type === category.type)
                                .map((profile, index) => (
                                    <ProfileItem
                                        key={index}
                                        onClick={() => handleProfileClick(profile)}
                                        isSelected={profile === selectedCard && !init}
                                        {...profile}
                                    />
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 