import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import React from "react";
import {FaCheck} from "react-icons/fa";

const PAGE_TITLE = `Project`

// 프로젝트 타입 정의
interface Project {
    title: string;
    organization: string;
    tags: string[];
}

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: PAGE_TITLE,
        description: "Ongoing and completed projects from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/research/project'
    });
};

export default function Page() {
    // 프로젝트 데이터를 배열로 정리
    const ongoingProjects: Project[] = [
        {
            title: "LLM 기반 추천을 위한 그래프 기반 컨텍스트 추출 에이전트 (2025-05-01 ~ 2025-11-20)",
            organization: "실감미디어 혁신융합대학(내부 연구과제)",
            tags: ["Graph ML/DL", "LLM Agent"]
        },
        {
            title: "멀티모달 생성모델의 신뢰성 및 제어가능성 향상을 위한 그래프 구조 기반의 상호작용 (2024-09-01 ~ 2028-08-31)",
            organization: "한국연구재단 중견연구(유형1)",
            tags: ["Multi-Modal LLMs", "Graph ML/DL", "Explainablilty"]
        },
        {
            title: "논리적 패턴을 반영할 수 있는 지식그래프 표현학습 (2024-04-01 ~ 2025-09-31)",
            organization: "KU학술연구비",
            tags: ["Knowledge Representation", "Graph ML/DL"]
        }
    ];

    const completedProjects: Project[] = [
        // 완료된 프로젝트들이 있다면 여기에 추가
    ];

    const totalProjects = ongoingProjects.length + completedProjects.length;

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={PAGE_TITLE}/>
            </div>

            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                {/* 총 프로젝트 개수 */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Total <span className="font-semibold text-gray-900">{totalProjects}</span> projects
                    </p>
                </div>

                {/* Ongoing Projects */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-header">Ongoing</p>
                            <div className="w-14 border-b-4 border-border-accent mt-1"></div>
                        </div>
                        <p className="text-gray-600">
                            <span className="font-semibold text-gray-900">{ongoingProjects.length}</span> projects
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
                        <ul className="space-y-6">
                            {ongoingProjects.map((project, index) => (
                                <li key={index} className="flex space-x-3">
                                    <FaCheck className="text-interactive-primary mt-1 text-[18px] md:text-[20px] flex-shrink-0"/>
                                    <div className="flex flex-col space-y-2">
                                        <span className="text-accent leading-snug">
                                            {project.title}
                                        </span>
                                        <span className="text-gray-700">{project.organization}</span>
                                        <div className="break-all">
                                            {project.tags.map((tag: string, tagIndex: number) => (
                                                <React.Fragment key={tagIndex}>
                                                    <span className="text-text-accent font-semibold pr-0.5">#</span>
                                                    <span className="text-text-secondary pr-2">{tag}</span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Completed Projects */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-header">Completed</p>
                            <div className="w-14 border-b-4 border-border-accent mt-1"></div>
                        </div>
                        <p className="text-gray-600">
                            <span className="font-semibold text-gray-900">{completedProjects.length}</span> projects
                        </p>
                    </div>

                    {completedProjects.length > 0 ? (
                        <div className="rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
                            <ul className="space-y-6">
                                {completedProjects.map((project, index) => (
                                    <li key={index} className="flex space-x-3">
                                        <FaCheck className="text-interactive-primary mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                        <div className="flex flex-col space-y-2">
                                            <span className="text-accent leading-relaxed">
                                                {project.title}
                                            </span>
                                            <span className="text-gray-700">{project.organization}</span>
                                            <div className="break-all">
                                                {project.tags.map((tag: string, tagIndex: number) => (
                                                    <React.Fragment key={tagIndex}>
                                                        <span className="text-text-accent font-semibold pr-0.5">#</span>
                                                        <span className="text-text-secondary pr-2">{tag}</span>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
                            <p className="text-gray-500 text-center py-8">No completed projects yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
