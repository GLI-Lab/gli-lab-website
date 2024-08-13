"use client"

import Image from 'next/image';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'
import { profiles as rawProfiles } from "@/assets/data/profiles";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"


interface ProfileCardProps {
    key?: number;
    onClick?: () => void;  // option
    isSelected?: boolean;  // option
    type: string;
    name_en: string;
    name_ko: string;
    admission: string;
    major: string;
    period: string;
    interest: string;
    photo: string[];
    email: string[];
    homepage: string;
    github: string[];
    linkedin: string;
}

const defaultProfile: ProfileCardProps = {
    type: "Unknown",
    name_en: "Unknown",
    name_ko: "Unknown",
    admission: "Unknown",
    major: "Unknown",
    period: "Unknown",
    interest: "Unknown",
    photo: ["/profiles/photo/ku_basic_1_down.png"],
    email: ["#"],
    homepage: "#",
    github: ["#"],
    linkedin: "#",
};

const profiles = rawProfiles.map(profile => ({
    ...defaultProfile,
    ...profile,
    type: profile.type ?? defaultProfile.type,
    name_en: profile.name_en ?? defaultProfile.name_en,
    name_ko: profile.name_ko ?? defaultProfile.name_ko,
    admission: profile.admission ?? defaultProfile.admission,
    period: profile.period ?? defaultProfile.period,
    interest: profile.interest ?? defaultProfile.interest,
    photo: profile.photo && profile.photo.length > 0 ? profile.photo : defaultProfile.photo,
    email: profile.email && profile.email.length > 0 ? profile.email : defaultProfile.email,
    homepage: profile.homepage || defaultProfile.homepage,
    github: profile.github && profile.github.length > 0 ? profile.github : defaultProfile.github,
    linkedin: profile.linkedin || defaultProfile.linkedin,
}));

const ProfileCard: React.FC<ProfileCardProps> = (props) => {
    const { onClick, type, name_en, name_ko, admission, photo, email, isSelected, period } = props;

    return (
        <div
            onClick={onClick}
            className={`border border-gray-300 p-2 flex gap-2 sm:gap-5 rounded-lg cursor-pointer group
                       ${isSelected ? 'bg-KU-dark_green text-white' : 'bg-white hover:border-KU-dark_green hover:shadow-lg'}`}
        >
            <div className="w-[115px] h-[135px] sm:w-[140px] sm:h-[160px] lg:w-[150px] lg:h-[170px] relative">
                <Image src={photo[0]} sizes="(max-width: 640px) 230px, (max-width: 1024px) 280px, 300px" alt="Profile" fill className="object-cover rounded-md"/>
            </div>
            <div className="flex-1 py-3 pr-1 flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <div>
                        <div className={`text-xl sm:text-2xl font-bold ${isSelected ? '' : 'group-hover:text-KU-dark_green'}`}>{name_ko}</div>
                        <div className={`text-lg sm:text-xl tracking-tight sm:tracking-normal ${isSelected ? '' : 'group-hover:text-KU-dark_green'}`}>{name_en}</div>
                    </div>
                    <div>
                        <div className={`text-xs sm:text-sm ${isSelected ? 'hidden' : 'text-gray-500 group-hover:underline group-hover:text-KU-dark_green'}`}>See more</div>
                    </div>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-2 sm:gap-x-4 tracking-tighter sm:tracking-normal text-sm sm:text-base
                                 ${isSelected ? 'group-hover:text-white' : 'text-gray-500'}`}>
                    {type === "undergraduate" ? (
                        <>
                            <span className={`${isSelected ? '' : 'group-hover:text-KU-dark_green'}`}>Period</span>
                            <span>{period}</span>
                        </>
                    ) : (
                        <>
                            <span className={`${isSelected ? '' : 'group-hover:text-KU-dark_green'}`}>Admission</span>
                            <span>{admission}</span>
                        </>
                    )}
                    <span className={`${isSelected ? '' : 'group-hover:text-KU-dark_green'}`}>E-mail</span>
                    <span>{email[0]}</span>
                </div>
            </div>
        </div>
    );
};


const SelectedProfileCard: React.FC<ProfileCardProps> = (props) => {
    const {title, name_en, name_ko, major, photo, email, interest, homepage, github, linkedin } = props;
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

    return (
        <div className="w-[300px] 1.5md:w-[320px] pt-4 bg-white flex flex-col items-center justify-center">
            <div className="">
                {/*<Image src={photo[0]} alt="Profile" layout="fill" className="h-full w-full object-cover"/>*/}
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
                    <div className="flex justify-center pt-2">
                        {photo.map((_, index) => (
                            <button
                                key={index}
                                className={`w-2.5 h-2.5 rounded-full mx-1 cursor-pointer
                                            ${index === selectedIndex ? 'bg-KU-dark_green' : 'bg-[#ccc]'}`}
                                onClick={() => emblaApi?.scrollTo(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full pt-3 tracking-tight sm:tracking-normal text-[15px] sm:text-[17px]">
                <div className="mb-6">
                    <h1 className="text-[28px] font-bold leading-none">{name_ko}</h1>
                    <h1 className="text-[22px]">{name_en}</h1>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 sm:gap-x-4`}>
                    <span className={`text-KU-dark_green highlight text-[17px] sm:text-[19px]`}>{title}</span>
                </div>
                <Separator className="my-3"/>

                <div className={`grid grid-cols-[auto,1fr] gap-x-4 sm:gap-x-4`}>
                    {/*<p>Admission: {admission}</p>*/}
                    <span className={`text-KU-dark_green font-medium`}>Major</span>
                    <span>{major}</span>
                    <span className={`text-KU-dark_green font-medium`}>Topics</span>
                    <div className="text-[14px] sm:text-[16px]">
                        {interest.split(',').map((item, index) => (
                            <>
                                <span key={index} className="text-KU-dark_green font-semibold pr-0.5">#</span>
                                <span className="text-KU-dark_gray pr-2">{item.trim()} </span>
                            </>
                        ))}
                    </div>
                    {/*<span>{interest}</span>*/}
                </div>
                <Separator className="my-3"/>

                <div className={`grid grid-cols-[auto,1fr] gap-x-4 sm:gap-x-4`}>
                    <span className={`text-KU-dark_green font-medium`}>Email</span>
                    <div className="flex flex-col">
                        {email.map((src, index) => (
                            <a href={`mailto:${src}`} key={index}
                               className="hover:text-KU-dark_green hover:underline underline-offset-4">{src}</a>
                        ))}
                    </div>
                    <span className={`text-KU-dark_green font-medium`}>Home</span>
                    <a href={homepage} target="_blank" rel="" title={homepage}
                       className="hover:text-KU-dark_green hover:underline underline-offset-4">
                        {homepage.replace("https://", "")}
                    </a>
                    <span className={`text-KU-dark_green font-medium`}>Github</span>
                    <div className="flex flex-col">
                        {github.map((src, index) => (
                            <a href={src} rel="" title={src} key={index} target="_blank"
                               className="hover:text-KU-dark_green hover:underline underline-offset-4 break-all">
                                {src.replace("https://github.com/", "")}
                            </a>
                        ))}
                    </div>
                    <span className={`text-KU-dark_green font-medium`}>LinkedIn</span>
                    <a href={linkedin} rel="" title={linkedin} target="_blank"
                       className="hover:text-KU-dark_green hover:underline underline-offset-4">
                    {linkedin.replace("https://www.linkedin.com/in/", "")}
                    </a>
                </div>
                <Separator className="my-3"/>
            </div>
        </div>
    );
};


const ProfileCardList: React.FC = () => {
    const [init, setInit] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [selectedCard, setSelectedCard] = useState<ProfileCardProps | null>(
        profiles.find(profile => profile.name_en === "Byungkook Oh") || null
    );

    const popupRef = useRef(null);
    const categories = [
        {title: 'Faculty', type: 'faculty'},
        // {title: 'Graduate Students', type: 'graduate'},
        {title: 'Undergraduate Interns', type: 'undergraduate'},
    ];


    const updateCanScroll = () => {
        const disableScroll = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                e.preventDefault();
            }
        };
        if (!init && selectedCard && window.innerWidth < 880){  // 1.5md
            document.body.style.overflow = 'hidden';
            document.addEventListener('touchmove', disableScroll, { passive: false });

        } else {
            document.body.style.overflow = 'auto';
            document.removeEventListener('touchmove', disableScroll);
        }
    };

    const checkBottom = () => {
        if (popupRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = popupRef.current;
            const atBottom = scrollHeight - scrollTop <= clientHeight + 20;
            setIsAtBottom(atBottom);
        }
    }

    useEffect(() => {
            // console.log(`${init}`);
            // console.log(`${selectedCard}`);
            // console.log(`resized: ${window.innerWidth}`);
        updateCanScroll();
        window.addEventListener('resize', updateCanScroll);
        window.addEventListener('resize', checkBottom);

        return () => {
            window.removeEventListener('resize', updateCanScroll);
            window.removeEventListener('resize', checkBottom);
        };
    }, [init, selectedCard]);  // init: 초기 selectedCard를 눌러도 동작하도록

    useEffect(() => {
        checkBottom();
    }, [init, selectedCard]);  // init: 초기 selectedCard를 눌러도 동작하도록


    return (
        <div className="max-w-screen-1.5xl mx-auto px-4 py-10 flex flex-row">

            {/* Detailed Profile (left side) */}
            {selectedCard &&
                <div className="hidden 1.5md:block 1.5md:pr-12 lg:pr-24 sticky self-start top-14">
                    <SelectedProfileCard {...selectedCard}/>
                </div>
            }

            {/* Detailed Profile (popup) */}
            {selectedCard && !init && (
                <div className="fixed inset-0 z-[100] bg-black bg-opacity-20 1.5md:hidden ">
                    <div className="fixed top-0 left-0 right-0 z-[150] px-6 pt-3 pb-24 max-h-screen flex justify-center">
                        <div className="w-[360px] 1.5md:w-[400px] max-h-screen pt-3 pb-0
                                       rounded-lg bg-white shadow-2xl border border-KU-dark_green relative overflow-hidden"
                        >
                            <div ref={popupRef} className="h-full w-full overflow-x-hidden overflow-y-scroll"
                                onScroll={checkBottom}
                                >
                                <button
                                    className="absolute top-0 right-3 z-[200] text-5xl text-KU-dark_green font-light"
                                    onClick={() => {
                                        setSelectedCard(null);
                                        document.body.style.overflow = 'auto';
                                    }}
                                >
                                    &times;
                                </button>
                                <div className="flex flex-col items-center justify-center pb-8">
                                    <SelectedProfileCard {...selectedCard}/>
                                </div>

                                {!isAtBottom && (
                                    <>
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center">
                                            <svg
                                                className="w-8 h-4 ml-2 text-KU-dark_green animate-bounce"
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

            {/*{selectedCard && !init && (*/}
            {/*    <div className="fixed inset-0 z-[100] bg-black bg-opacity-20 1.5md:hidden">*/}
            {/*        <div className="fixed top-0 left-0 right-0 z-[150] flex px-6 pt-3 pb-24 max-h-screen justify-center">*/}
            {/*            <div className="w-[360px] 1.5md:w-[400px] max-h-screen pt-3 pb-0*/}
            {/*                           rounded-lg bg-white shadow-2xl border border-KU-dark_green relative overflow-hidden"*/}
            {/*            >*/}
            {/*                <div ref={popupRef} className="h-full w-full overflow-x-hidden overflow-y-scroll"*/}
            {/*                    onScroll={checkBottom}*/}
            {/*                    >*/}
            {/*                    <button*/}
            {/*                        className="absolute top-0 right-3 z-[200] text-5xl text-KU-dark_green font-light"*/}
            {/*                        onClick={() => {*/}
            {/*                            setSelectedCard(null);*/}
            {/*                            document.body.style.overflow = 'auto';*/}
            {/*                        }}*/}
            {/*                    >*/}
            {/*                        &times;*/}
            {/*                    </button>*/}
            {/*                    <div className="flex flex-col items-center justify-center pb-8">*/}
            {/*                        <SelectedProfileCard {...selectedCard}/>*/}
            {/*                    </div>*/}

            {/*                    {!isAtBottom && (*/}
            {/*                        <>*/}
            {/*                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"></div>*/}
            {/*                            <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center">*/}
            {/*                                <svg*/}
            {/*                                    className="w-8 h-4 ml-2 text-KU-dark_green animate-bounce"*/}
            {/*                                    fill="none"*/}
            {/*                                    stroke="currentColor"*/}
            {/*                                    viewBox="0 0 24 24"*/}
            {/*                                    xmlns="http://www.w3.org/2000/svg"*/}
            {/*                                >*/}
            {/*                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2 9l10 10 10-10" />*/}
            {/*                                </svg>*/}
            {/*                            </div>*/}
            {/*                        </>*/}
            {/*                    )}*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* Abstract Profile */}
            <div className="flex-1 pt-4">
                {categories.map((category) => (
                    <div key={category.type}>
                        <div>
                            <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">{category.title}</h2>
                            <div className="w-14 border-b-4 border-KU-dark_green mt-1 mb-6"></div>
                        </div>
                        <div className="grid grid-cols-1 1.5xl:grid-cols-2 gap-x-4 gap-y-4 1.5xl:gap-y-6 mb-10">
                            {profiles
                                .filter(profile => profile.type === category.type)
                                .map((profile, index) => (
                                    <ProfileCard
                                        key={index}
                                        onClick={() => {
                                            if (profile !== selectedCard) {
                                                setInit(false);
                                                setSelectedCard(profile);
                                            } else {
                                                // setSelectedCard(null);
                                                setInit(false);
                                                setSelectedCard(profile);
                                            }
                                        }}
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
    )
}


export default ProfileCardList;
