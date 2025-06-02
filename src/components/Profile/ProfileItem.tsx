"use client"

import Image from 'next/image';
import React from 'react';
import { ProfileItemProps } from './profiles';

export const ProfileItem: React.FC<ProfileItemProps> = (props) => {
    const { onClick, type, name_en, name_ko, admission, photo, email, isSelected, joined } = props;
    console.log('----ProfileItem rendered:', name_ko);

    return (
        <div
            onClick={onClick}
            className={`border border-gray-300 px-2 py-2 flex gap-2 sm:gap-5 rounded-lg cursor-pointer group
                       ${isSelected ? 'bg-brand-primary text-white' : 'bg-white hover:border-interactive-primary hover:shadow-lg'}`}
        >
            <div className="w-[115px] h-[135px] sm:w-[140px] sm:h-[160px] lg:w-[150px] lg:h-[170px] relative">
                <Image src={photo[0]} sizes="(max-width: 640px) 230px, (max-width: 1024px) 280px, 300px" alt="Profile" fill className="object-cover rounded-md"/>
            </div>
            <div className="flex-1 py-3 pr-1 flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <div>
                        <div className={`text-xl sm:text-2xl font-bold ${isSelected ? '' : 'group-hover:text-interactive-primary'}`}>{name_ko}</div>
                        <div className={`text-lg sm:text-xl tracking-tight sm:tracking-normal ${isSelected ? '' : 'group-hover:text-interactive-primary'}`}>{name_en}</div>
                    </div>
                    <div>
                        <div className={`text-xs sm:text-sm ${isSelected ? 'hidden' : 'text-gray-500 group-hover:underline group-hover:text-interactive-primary'}`}>See more</div>
                    </div>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-2 sm:gap-x-4 tracking-tighter sm:tracking-normal text-sm sm:text-base
                                 ${isSelected ? 'group-hover:text-white' : 'text-gray-500'}`}>
                    {(type === "intern") || (type === "pms") || (type === "pphd") ? (
                        <>
                            <span className={`${isSelected ? '' : 'group-hover:text-interactive-primary'}`}>Joined</span>
                            <span>{joined}</span>
                        </>
                    ) : type === "faculty" ? (
                        <>
                            <span className={`${isSelected ? '' : 'group-hover:text-interactive-primary'}`}>Office</span>
                            <span>C384-2, Engineering Hall</span>
                        </>
                    ) : (
                        <>
                            <span className={`${isSelected ? '' : 'group-hover:text-interactive-primary'}`}>Admission</span>
                            <span>{admission}</span>
                        </>
                    )}
                    <span className={`${isSelected ? '' : 'group-hover:text-interactive-primary'}`}>E-mail</span>
                    <span>{email[0]}</span>
                </div>
            </div>
        </div>
    );
}; 