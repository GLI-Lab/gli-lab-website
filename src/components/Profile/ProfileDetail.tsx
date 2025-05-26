"use client"

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from "embla-carousel-react"
import Fade from 'embla-carousel-fade'
import { Separator } from "@/components/ui/separator"
import { ProfileDetailProps } from './types';

export const ProfileDetail: React.FC<ProfileDetailProps> = (props) => {
    const {title, name_en, name_ko, admission, period, bs, ms, phd, photo, email, interest, homepage, github, linkedin } = props;
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
                    
                    {/* 이미지 인디케이터 */}
                    <div className="flex justify-center pt-2">
                        {photo.map((_, index) => (
                            <button
                                key={index}
                                className={`w-3 h-3 rounded-full mx-1 cursor-pointer
                                            ${index === selectedIndex ? 'bg-interactive-primary' : 'bg-[#ccc]'}`}
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
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1`}>
                    <span className={`text-brand-primary highlight text-[17px] sm:text-[19px]`}>{title}</span>
                </div>
                <div className="my-3"></div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4`}>
                    {admission !== "Unknown" && (
                        <>
                            <span className={`text-text-accent font-medium`}>Admission</span>
                            <span>{admission}</span>
                        </>
                    )}
                    {period !== "Unknown" && (
                        <>
                            <span className={`text-text-accent font-medium`}>Period</span>
                            <span>{period}</span>
                        </>
                    )}
                </div>
                <Separator className="my-3"/>

                <div className={`grid gap-x-4 gap-y-1 my-3`}>
                    <span className={`text-text-accent font-medium`}>Research Interests</span>
                    <div className="text-[14px] sm:text-[16px]">
                        {interest.split(',').map((item, index) => (
                            <React.Fragment key={index}>
                                <span key={index} className="text-text-accent font-semibold pr-0.5">#</span>
                                <span className="text-text-secondary pr-2">{item.trim()} </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4`}>
                    {bs !== "Unknown" && (
                        <>
                            <span className={`text-text-accent font-medium`}>B.S.</span>
                            <span>{bs}</span>
                        </>
                    )}
                    {ms !== "Unknown" && (
                        <>
                            <span className={`text-text-accent font-medium`}>M.S.</span>
                            <span>{ms}</span>
                        </>
                    )}
                    {phd !== "Unknown" && (
                        <>
                            <span className={`text-text-accent font-medium`}>Ph.D.</span>
                            <span>{phd}</span>
                        </>
                    )}
                </div>
                <Separator className="my-3"/>

                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1`}>
                    <span className={`text-text-accent font-medium`}>Email</span>
                    <div className="flex flex-col">
                        {email.map((src, index) => (
                            <a href={`mailto:${src}`} key={index}
                               className="hover:text-interactive-hover hover:underline underline-offset-4">{src}</a>
                        ))}
                    </div>
                    <span className={`text-text-accent font-medium`}>Home</span>
                    <a href={homepage} target="_blank" rel="" title={homepage}
                       className="hover:text-interactive-hover hover:underline underline-offset-4">
                        {homepage.replace("https://", "").split('/')[0]}
                    </a>
                    <span className={`text-text-accent font-medium`}>Github</span>
                    <div className="flex flex-col">
                        {github.map((src, index) => (
                            <a href={src} rel="" title={src} key={index} target="_blank"
                               className="hover:text-interactive-hover hover:underline underline-offset-4 break-all">
                                {src.replace("https://github.com/", "")}
                            </a>
                        ))}
                    </div>
                    <span className={`text-text-accent font-medium`}>LinkedIn</span>
                    <a href={linkedin} rel="" title={linkedin} target="_blank"
                       className="hover:text-interactive-hover hover:underline underline-offset-4">
                        {linkedin.replace("https://www.linkedin.com/in/", "")}
                    </a>
                </div>
                <Separator className="my-3"/>
            </div>
        </div>
    );
}; 