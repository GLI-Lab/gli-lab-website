import Image from "next/image";
import Link from 'next/link';

import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { FaCheck } from "react-icons/fa";

const TITLE = `Research Topics`

export async function generateMetadata() {
    return getMetadata({
        title: TITLE,
        description: "Research topics and approaches from GLI Lab - Graph Learning and Intelligence Laboratory focusing on Graph ML/DL, LLMs, and their applications",
        asPath: '/research/topics'
    });
};

// 연구 데이터 정의
const researchData = {
    approaches: [
        {
            title: "Graph Representation Learning (그래프 표현학습)",
            items: [
                "Graph Neural Networks (GNNs) for Node/Edge/Graph Embedding",
                "Knowledge Graph Representation/Completion/Validation/Construction",
                "Context-Aware Knowledge Graph Representation and Relational Learning"
            ]
        },
        {
            title: "Large Language Models (대형 언어모델)",
            items: [
                "Multi-Modal & Knowledge-Enhanced Foundation Models",
                "Knowledge & LLM Distillation for Efficient Model Development",
                "Advanced Prompt Engineering: Chain-of-Thought (CoT), and Retrieval-Augmented Generation (RAG)"
            ]
        },
        {
            title: "Synergizing LLMs and Graphs (그래프·언어모델 통합)",
            items: [
                "Text-to-Graph & Graph-to-Text Generation",
                "Graph-Structured Interaction for LLMs (GraphRAG, Graph-driven LLM Agents)",
                "Knowledge-grounded & Context-aware Response Generation with LLMs"
            ]
        }
    ],
    applications: [
        {
            title: "Natural Language Processing (자연어처리)",
            items: [
                "Question Answering, Information Retrieval & Extraction",
                "Document Analysis (Sentiment, Opinion, Topic, NER, Summarization)"
            ]
        },
        {
            title: "Recommender Systems (추천시스템)",
            items: [
                "Knowledge-enhanced & Explainable Recommendations",
                "Conversational & Graph-based Recommendations"
            ]
        },
        {
            title: "Graph Analytics and Prediction (그래프 분석·예측)",
            items: [
                "Node & Graph Classification Tasks",
                "Link Prediction and Knowledge Graph Completion"
            ]
        }
    ]
};

// 연구 항목 컴포넌트
const ResearchSection = ({ 
    title, 
    items, 
    bgColor = "bg-gray-100" 
}: { 
    title: string; 
    items: string[]; 
    bgColor?: string; 
}) => (
    <div className={`${bgColor} rounded-lg p-4 overflow-hidden`}>
        <p className="text-accent mb-3 font-semibold break-words">
            {title}
        </p>
        <div className="grid gap-2 text-gray-700">
            {items.map((item, index) => (
                <div key={index} className="break-words flex leading-snug">
                    <span className="mr-2 flex-shrink-0">-</span>
                    <span>{item}</span>
                </div>
            ))}
        </div>
    </div>
);

// 섹션 헤더 컴포넌트
const SectionHeader = ({ title }: { title: string }) => (
    <p className="text-accent text-lg md:text-xl font-semibold mb-4">
        <span className="highlight">&lt;{title}&gt;</span>
    </p>
);

export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>

            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                {/* Summary Section */}
                <div className="mb-12">
                    <p className="text-header">Summary</p>
                    <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>

                    <div className="max-w-screen-xl mx-auto rounded-lg border border-gray-200 shadow-sm p-3 md:p-5">
                        <div className="flex flex-col items-center justify-center text-center space-y-8">
                            <p className="text-home">
                                본 연구실은 궁극적으로 자연어처리, 추천시스템, 그래프 표현학습, LLM-그래프 융합, 이상탐지에서 
                                다음과 같은 최신 기술들을 연구개발하고 있습니다.
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center !mt-6">
                                <a 
                                    href="/pdf/Graph-based AI_part1_v251028.pdf" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Graph-based AI (Part 1)
                                </a>
                                <a 
                                    href="/pdf/Graph-based AI_part2_v251104.pdf" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Graph-based AI (Part 2)
                                </a>
                            </div>

                            <ul className="list-none list-inside space-y-6 md:space-y-10 text-left text-home">
                                <li className="space-y-2 leading-snug">
                                    <div className="space-y-1">
                                        <div className="flex space-x-2">
                                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                            <span><span className="font-semibold underline underline-offset-4">자연어처리</span>: 질의응답, 정보 검색/추출, 지식/LLM 증류 및 응용</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                        → 그래프 지식을 통합하여 LLM의 환각 문제를 줄이고, 더 일관된 응답 생성 가능
                                    </div>
                                </li>
                                <li className="space-y-2 leading-snug">
                                    <div className="space-y-1">
                                        <div className="flex space-x-2">
                                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                            <span><span className="font-semibold underline underline-offset-4">추천시스템</span>: 지식기반/설명가능한 추천, 멀티모달/대화형 추천, 그래프 기반 추천</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                        → 그래프 기반의 사용자–아이템 관계 확장을 통해 의도와 맥락 중심의 추천 가능
                                    </div>
                                </li>
                                <li className="space-y-2 leading-snug">
                                    <div className="space-y-1">
                                        <div className="flex space-x-2">
                                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                            <span><span className="font-semibold underline underline-offset-4">그래프 표현학습</span>: 그래프 뉴럴네트워크(GNNs), 지식그래프 표현/완성/검증/구축
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                        → 그래프 구축/확장 및 다양한 딥러닝 모델과의 통합을 위한 기반 기술로 활용 가능
                                    </div>
                                </li>
                                <li className="space-y-2 leading-snug">
                                    <div className="space-y-1">
                                        <div className="flex space-x-2">
                                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                            <span><span className="font-semibold underline underline-offset-4">LLM–그래프 융합</span>: 지식기반/멀티모달 LLM, 텍스트-그래프 변환, LLM 에이전트, GraphRAG</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                        → 그래프를 통해 LLM에 외부 지식을 입력하여 신뢰성 높고 도메인 특화 응답 생성 가능
                                    </div>
                                </li>
                                <li className="space-y-2 leading-snug">
                                    <div className="space-y-1">
                                        <div className="flex space-x-2">
                                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                            <span><span className="font-semibold underline underline-offset-4">이상탐지</span>: 네트워크/그래프 이상탐지, 사용자 행동 기반 이상탐지, 멀티모달 이상탐지</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                        → 그래프를 통해 행위 간의 상관관계를 모델링하여 상황 맥락에 맞는 이상 탐지 가능
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Approaches Section */}
                <div className="mb-12">
                    <p className="text-header">Approaches</p>
                    <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>

                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 md:p-5 overflow-hidden">
                        {/* Approaches Section */}
                        <div>
                            <div className="grid gap-3 md:gap-4">
                                {researchData.approaches.map((approach, index) => (
                                    <ResearchSection 
                                        key={index}
                                        title={approach.title}
                                        items={approach.items}
                                        bgColor=""
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications Section */}
                <div className="mb-12">
                    <p className="text-header">Applications</p>
                    <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>

                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 md:p-5 overflow-hidden">

                        {/* Applications Section */}
                        <div>
                            <div className="grid gap-3 md:gap-4">
                                {researchData.applications.map((application, index) => (
                                    <ResearchSection 
                                        key={index}
                                        title={application.title}
                                        items={application.items}
                                        bgColor=""
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Poster Section */}
                {/* <div>
                    <p className="text-header">Poster</p>
                    <div className="w-14 border-b-4 border-border-accent mt-1 mb-6"></div>

                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 md:p-5 overflow-hidden">
                        <div className="space-y-6">
                            <div className="text-center">
                                <Image 
                                    src="/images/topic/poster1.webp" 
                                    alt="Research Topic Poster 1" 
                                    width={1600} 
                                    height={2000}
                                    className="max-w-full h-auto object-contain rounded-lg"
                                />
                            </div>
                            <div className="text-center">
                                <Image 
                                    src="/images/topic/poster2.webp" 
                                    alt="Research Topic Poster 2" 
                                    width={1600} 
                                    height={2000}
                                    className="max-w-full h-auto object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>

            <div className="h-40"></div>
        </>
    )
}