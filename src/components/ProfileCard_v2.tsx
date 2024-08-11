"use client"

import Image from 'next/image';
import React, {useState} from "react";
import { profiles as rawProfiles } from "@/assets/data/profiles";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"



interface ProfileCardProps {
    onClick?: () => void;  // option
    isSelected?: boolean;  // option
    type: string;
    name_en: string;
    name_ko: string;
    admission: string;
    period: string;
    interest: string;
    photo: string[];
    email: string[];
    homepage: string;
    github: string;
    linkedin: string;
}

const defaultProfile: ProfileCardProps = {
    type: "Unknown",
    name_en: "Unknown",
    name_ko: "Unknown",
    admission: "Unknown",
    period: "Unknown",
    interest: "Unknown",
    photo: ["/profiles/photo/ku_basic_1_down.png"],
    email: ["no-email@example.com"],
    homepage: "#",
    github: "#",
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
    github: profile.github || defaultProfile.github,
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
                <Image src={photo[0]} alt="Profile" layout="fill" className="h-full w-full object-cover rounded-md"/>
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
    const {name_en, name_ko, photo, email, interest, homepage, github, linkedin } = props;

    return (
        <div className="w-[300px] 1.5md:w-[320px] pt-4 bg-white flex flex-col items-center justify-center">
            <div className="w-[280px] h-[330px] 1.5md:w-[320px] 1.5md:h-[400px] relative">
                <Image src={photo[0]} alt="Profile" layout="fill" className="h-full w-full object-cover"/>
            </div>
            <div className="w-full pt-6 tracking-tight sm:tracking-normal text-[15px] sm:text-[17px]">
                <div className="">
                    <h1 className="text-[28px] font-bold leading-none">{name_ko}</h1>
                    <h1 className="text-[22px]">{name_en}</h1>
                </div>
                <Separator className="my-4"/>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 sm:gap-x-4`}>
                    {/*<p>Admission: {admission}</p>*/}
                    <span className={`text-KU-dark_green font-medium`}>Major</span>
                    <span>-</span>
                    <span className={`text-KU-dark_green font-medium`}>Topics</span>
                    <span>{interest}</span>
                </div>
                <Separator className="my-4"/>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 sm:gap-x-4`}>
                    <span className={`text-KU-dark_green font-medium`}>Email</span>
                    <a href={`mailto:${email[0]}`}
                       className="hover:text-KU-dark_green hover:underline underline-offset-4">{email[0]}</a>
                    <span className={`text-KU-dark_green font-medium`}>Homepage</span>
                    <a href={homepage} target="_blank" rel=""
                       className="hover:text-KU-dark_green hover:underline underline-offset-4">{homepage}</a>
                    <span className={`text-KU-dark_green font-medium`}>Github</span>
                    <a href={github} rel=""
                       className="hover:text-KU-dark_green hover:underline underline-offset-4">{github}</a>
                    <span className={`text-KU-dark_green font-medium`}>LinkedIn</span>
                    <a href={linkedin} rel=""
                       className="hover:text-KU-dark_green hover:underline underline-offset-4">{linkedin}</a>
                </div>
                <Separator className="my-4"/>

            </div>
        </div>
    );
};


const ProfileCardList: React.FC = () => {
    const defaultSelectedProfile = window.innerWidth > 880
        ? profiles.find(profile => profile.name_en === "Byungkook Oh") || null
        : null;
    const [selectedCard, setSelectedCard] = useState<ProfileCardProps | null>(defaultSelectedProfile);
    const categories = [
        {title: 'Faculty', type: 'faculty'},
        // {title: 'Graduate Students', type: 'graduate'},
        {title: 'Undergraduate Interns', type: 'undergraduate'},
    ];

    return (
        <div className="max-w-screen-1.5xl mx-auto px-4 py-10 flex flex-row">

            {/* Detailed Profile (left side) */}
            {selectedCard !== null &&
                <div className="hidden 1.5md:block 1.5md:pr-12 lg:pr-24 sticky self-start top-12">
                    <SelectedProfileCard {...selectedCard}/>
                </div>
            }

            {/* Detailed Profile (popup) */}
            {selectedCard !== null && (
                <div className="fixed inset-0 z-[9999] bg-black bg-opacity-20 1.5md:hidden">
                    <div className="fixed top-0 left-0 right-0 bottom-auto flex px-6 pt-3 justify-center overflow-y-auto">
                        <ScrollArea
                            className="w-[360px] 1.5md:w-[400px] max-h-screen pt-3 pb-14 rounded-lg bg-white shadow-2xl border border-KU-dark_green relative overflow-y-auto">
                            <button
                                className="absolute top-0 right-3 z-50 text-5xl text-KU-dark_green font-light"
                                onClick={() => {
                                    setSelectedCard(null);
                                    document.body.style.overflow = 'auto';  // 팝업 닫을 때 body 스크롤 복원
                                }}
                            >
                                &times;
                            </button>
                            <div className="flex flex-col items-center justify-center pb-14">
                                <SelectedProfileCard {...selectedCard}/>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}

            {/* Abstract Profile */}
            <div className="flex-1 pt-4">
                {categories.map((category) => (
                    <div>
                        <div>
                            <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">{category.title}</h2>
                            <div className="w-14 border-b-4 border-KU-dark_green mt-1 mb-6"></div>
                        </div>
                        <div className="grid grid-cols-1 1.5xl:grid-cols-2 gap-x-4 gap-y-4 1.5xl:gap-y-6 mb-10">
                            {profiles
                                .filter(profile => profile.type === category.type)
                                .map((profile) => (
                                    <ProfileCard
                                        onClick={() => setSelectedCard(profile)}
                                        isSelected={profile === selectedCard}
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
