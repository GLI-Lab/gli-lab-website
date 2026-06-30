"use client"

import React from 'react';
import { Separator } from "@/components/ui/separator"
import { ProfileDetailProps } from '@/data/loaders/types';
import { ProfileDetailPaper } from './ProfileDetailPaper';
import { ProfileDetailPatent } from './ProfileDetailPatent';
import { ProfileDetailProject } from './ProfileDetailProject';
import { ProfileDetailStudy } from './ProfileDetailStudy';
import { ProfileDetailSeminar } from './ProfileDetailSeminar';
import { hasAffiliation, ProfileAffiliationText } from './ProfileAffiliationText';
import { hasCaptain, ProfileCaptainText } from './ProfileCaptainText';
import { getSeminarsForProfile } from '@/data/loaders/utils';

export const ProfileListDetail: React.FC<ProfileDetailProps> = (props) => {
    const {id, yamlId, type, title, name_en, name_ko, admission, joined_start, joined_end, bs, ms, phd, email, interest, homepage, github, linkedin, scholar, graduation, affiliation, captain, cv, cvVersion, studies = [], papers = [], patents = [], projects = [], seminars = [], isAlumniPage = false } = props;

    const renderEducation = (
        label: string,
        edu: string[],
        addTopMargin: boolean = false
    ) => {
        const items = (edu || []).filter(item => typeof item === 'string' && item.trim() !== '');
        if (items.length === 0) return null;
        return items.map((item, idx) => {
            const commaIndex = item.indexOf(',');
            const before = commaIndex >= 0 ? item.slice(0, commaIndex).trim() : item.trim();
            const after = commaIndex >= 0 ? item.slice(commaIndex + 1).trim() : '';
            const groupTopMargin = addTopMargin && idx === 0 ? ' mt-1' : '';
            return (
                <React.Fragment key={idx}>
                    <span className={`text-text-accent font-medium${groupTopMargin}`}>{idx === 0 ? label : ''}</span>
                    <span className={`text-[15.5px] md:text-[16.5px] leading-snug pt-0.5${groupTopMargin}`}>
                        {before}
                        {after && (
                            <span className="text-text-secondary italic text-[14.5px] md:text-[15.5px]">, {after}</span>
                        )}
                    </span>
                </React.Fragment>
            );
        });
    };
    // 현재 프로필과 관련된 스터디를 필터링하는 함수
    const filterStudiesForProfile = (allStudies: any[], profile: any) => {
        return allStudies.filter(study => 
            study.participants.some((participant: string) => {
                // <profile=[date] name>Full Name</> 형식 파싱
                const profileMatch = participant.match(/^<profile=(.+?)>(.+?)<\/>$/);
                if (profileMatch) {
                    const [, profileId, ] = profileMatch;
                    return profileId === profile.yamlId;
                }
                return false;
            })
        );
    };

    // 현재 프로필과 관련된 논문을 필터링하는 함수
    const getPapersForProfile = (allPapers: any[], profileId: string) => {
        return allPapers.filter(paper => 
            paper.authors.some((author: any) => author.ID === profileId)
        );
    };

    // 현재 프로필과 관련된 특허를 필터링하는 함수
    const getPatentsForProfile = (allPatents: any[], profileId: string) => {
        return allPatents.filter(patent => 
            patent.authors.some((author: any) => author.ID === profileId)
        );
    };

    // 현재 프로필과 관련된 스터디와 논문 필터링
    const filteredStudies = filterStudiesForProfile(studies, { id });
    const filteredPapers = getPapersForProfile(papers, yamlId);
    const filteredPatents = getPatentsForProfile(patents, yamlId);
    const filteredSeminars = getSeminarsForProfile(seminars, yamlId);


    return (
        <div className="flex flex-col">
            <div className="w-full text-[16px] md:text-[17px]">
                {/* <div className="mb-6">
                    <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 mb-1`}>
                        <span className={`text-brand-primary highlight text-[18px] md:text-[19px] whitespace-nowrap`}>{title}</span>
                    </div>
                    <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 mb-1`}>
                        <span className={`text-brand-primary highlight-2 text-[18px] md:text-[19px]`}>{affiliation}</span>
                    </div>
                    <div className="my-3"></div>
                </div> */}

                {/* Status */}
                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-0.5 items-center">
                    {joined_start && joined_end && (
                        <><span className={`text-text-accent font-medium`}>Joined</span><span className="text-[15.5px] md:text-[16.5px] pl-1">{joined_start} - {joined_end}</span></>
                    )}
                    {graduation && (
                        <><span className={`text-text-accent font-medium`}>Graduation</span><span className="text-[15.5px] md:text-[16.5px]">{graduation}</span></>
                    )}
                    {admission && (
                        <><span className={`text-text-accent font-medium`}>Admission</span><span className="text-[15.5px] md:text-[16.5px] pl-1">{admission}</span></>
                    )}
                    {hasCaptain(captain) && (
                        <>
                            <span className={`text-text-accent font-medium self-start`}>Captain</span>
                            <span className="text-[15.5px] md:text-[16.5px] self-start min-w-0">
                                <ProfileCaptainText captain={captain} />
                            </span>
                        </>
                    )}
                    {hasAffiliation(affiliation) && (
                        <>
                            <span className={`text-text-accent font-medium self-start`}>Affiliation</span>
                            <span className="text-[15.5px] md:text-[16.5px] self-start min-w-0 pl-1">
                                <ProfileAffiliationText
                                    affiliation={affiliation}
                                    showVerified
                                    currentClassName="font-semibold underline"
                                />
                            </span>
                        </>
                    )}
                </div>
                
                {type !== "faculty" && (
                    <Separator className="my-3"/>
                )}

                {/* Education */}
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 items-start`}>
                    {renderEducation('B.S.', bs)}
                    {renderEducation('M.S.', ms, true)}
                    {renderEducation('Ph.D.', phd, true)}
                </div>
                <Separator className="my-3"/>

                {/* Contact */}
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-start`}>
                    <span className={`text-text-accent font-medium`}>CV</span>
                    <div className="flex flex-col">
                        {cv ? (
                            <a href={cv} target="_blank" rel="noopener noreferrer" title="Download CV"
                               className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                Download CV{cvVersion ? ` (${cvVersion})` : ''}
                            </a>
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>Email</span>
                    <div className="flex flex-col">
                        {email.length > 0 && email.some(e => e.trim() !== '') ? (
                            email.filter(e => e.trim() !== '').map((src, index) => (
                                <a href={`mailto:${src}`} key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">{src}</a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                </div>
                <Separator className="my-3"/>
                <div className={`grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-start`}>
                    <span className={`text-text-accent font-medium`}>Home</span>
                    <div className="flex flex-col">
                        {homepage.length > 0 && homepage.some(h => h.trim() !== '') ? (
                            homepage.filter(h => h.trim() !== '').map((src, index) => (
                                <a href={src} target="_blank" rel="" title={src} key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://", "").split('/')[0]}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>Github</span>
                    <div className="flex flex-col">
                        {github.length > 0 && github.some(g => g.trim() !== '') ? (
                            github.filter(g => g.trim() !== '').map((src, index) => (
                                <a href={src} rel="" title={src} key={index} target="_blank"
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 break-all text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://github.com/", "")}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>LinkedIn</span>
                    <div className="flex flex-col">
                        {linkedin.length > 0 && linkedin.some(l => l.trim() !== '') ? (
                            linkedin.filter(l => l.trim() !== '').map((src, index) => (
                                <a href={src} rel="" title={src} target="_blank" key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://www.linkedin.com/in/", "")}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                    <span className={`text-text-accent font-medium`}>Scholar</span>
                    <div className="flex flex-col">
                        {scholar.length > 0 && scholar.some(s => s.trim() !== '') ? (
                            scholar.filter(s => s.trim() !== '').map((src, index) => (
                                <a href={src} rel="" title={src} target="_blank" key={index}
                                   className="hover:text-interactive-hover hover:underline underline-offset-4 text-[15.5px] md:text-[16.5px]">
                                    {src.replace("https://scholar.google.com/citations?user=", "")}
                                </a>
                            ))
                        ) : (
                            <span className="text-[15.5px] md:text-[16.5px]">-</span>
                        )}
                    </div>
                </div>
                <Separator className="my-3"/>

                <ProfileDetailPaper papers={filteredPapers} profileYamlId={yamlId} />
                <ProfileDetailPatent patents={filteredPatents} profileYamlId={yamlId} />
                <ProfileDetailProject projects={projects} profileId={yamlId} />
                <ProfileDetailSeminar seminars={filteredSeminars} profileYamlId={yamlId} />
                <ProfileDetailStudy studies={filteredStudies} profileYamlId={yamlId} />
            </div>
        </div>
    );
};
