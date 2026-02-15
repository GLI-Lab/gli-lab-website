import React from "react";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import SectionHeader from "@/components/ui/SectionHeader";

const TITLE = `Vision and Topics`

export async function generateMetadata() {
    return getMetadata({
        title: TITLE,
        description: "Research vision and areas from GLI Lab - Knowledge-driven AI, Neuro-Symbolic AI, and Graph-Language fusion for the future of AGI",
        asPath: '/research/topics'
    });
};

// 연구 데이터 정의
const researchData = {
    approaches: [
        {
            title: "Graph Intelligence (그래프 표현학습)",
            items: [
                "Graph Neural Networks (GNNs) for Node/Edge/Graph Embedding",
                "Knowledge Graph Representation/Completion/Validation/Construction",
                "Context-Aware Knowledge Graph Representation and Relational Learning"
            ],
            description: "그래프 구조와 엔티티·관계를 임베딩하고, 지식그래프의 표현·완성·검증을 위한 핵심 방법론을 연구합니다."
        },
        {
            title: "Language Intelligence (대형 언어모델)",
            items: [
                "Multi-Modal & Knowledge-Enhanced Foundation Models",
                "Knowledge & LLM Distillation for Efficient Model Development",
                "Advanced Prompt Engineering: Chain-of-Thought (CoT), and Retrieval-Augmented Generation (RAG)"
            ],
            description: "멀티모달·지식 증강 기반 대형 언어모델과 CoT, RAG 등을 통해 일관된 이해·추론·생성 능력을 높입니다."
        },
        {
            title: "Graph-Language Fusion (그래프·언어모델 통합)",
            items: [
                "Text-to-Graph & Graph-to-Text Generation",
                "Graph-Structured Interaction for LLMs (GraphRAG, Graph-driven LLM Agents)",
                "Knowledge-grounded & Context-aware Response Generation with LLMs"
            ],
            description: "그래프와 LLM을 결합해 외부 지식을 활용한 응답 생성, GraphRAG·에이전트 등 신뢰 가능하고 도메인 적응형 AI를 추구합니다."
        }
    ],
    applications: [
        {
            title: "Graph-Centric AI (그래프 분석·예측)",
            items: [
                "Graph Neural Networks (GNNs) for Node/Edge/Graph Representation",
                "Knowledge Graph Representation, Completion, Validation & Construction",
                "Node & Graph Classification, Link Prediction"
            ],
            description: "노드·링크·그래프 수준의 분석·분류·예측을 통해 그래프 구축·확장 및 다른 딥러닝 모델과의 통합 기반을 마련합니다."
        },
        {
            title: "Language-Centric AI (자연어처리)",
            items: [
                "Question Answering, Information Retrieval & Extraction",
                "Document Analysis (Sentiment, Opinion, Topic, NER, Summarization)",
                "Knowledge & LLM Distillation and Applications"
            ],
            description: "질의응답·검색·추출·문서 분석 등에 그래프 지식을 결합해 LLM 환각을 줄이고, 일관되고 근거 있는 응답 생성을 목표로 합니다."
        },
        {
            title: "Recommender Systems (추천시스템)",
            items: [
                "Knowledge-enhanced & Explainable Recommendations",
                "Multimodal & Conversational Recommendations",
                "Graph-based User–Item Relation Modeling"
            ],
            description: "사용자–아이템·지식 그래프를 확장해 의도·맥락·설명 가능성을 반영한 추천과 대화형 추천을 연구합니다."
        },
        {
            title: "Anomaly Detection (이상탐지)",
            items: [
                "Network & Graph-based Anomaly Detection",
                "User Behavior-based Anomaly Detection",
                "Multimodal Anomaly Detection"
            ],
            description: "네트워크·행동·멀티모달 데이터를 그래프로 모델링하여, 행위 간 상관관계와 맥락을 반영한 이상 탐지를 수행합니다."
        }
    ]
};

// 연구 항목 컴포넌트
/** 제목에서 ( ) 부분을 한 덩어리로 묶어 줄바꿈 시 통째로 다음 줄로 넘어가게 함 */
function titleWithNowrapParens(title: string) {
    const parts = title.split(/(\([^)]*\))/g);
    return parts.map((part, i) =>
        part.startsWith("(") ? (
            <span key={i} className="whitespace-nowrap">{part}</span>
        ) : (
            part
        )
    );
}

const ResearchSection = ({ 
    title, 
    items, 
    description,
    children,
    bgColor = "bg-white" 
}: { 
    title: string; 
    items: string[]; 
    description?: string;
    children?: React.ReactNode;
    bgColor?: string; 
}) => (
    <div className={`${bgColor} rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 p-4 md:p-5 overflow-hidden h-full flex flex-col`}>
        <div className="flex flex-col items-center text-center max-w-xl mx-auto w-full">
            <p className="text-lg md:text-xl font-semibold text-gray-800 leading-snug break-words mb-4 md:mb-5 w-full">
                {titleWithNowrapParens(title)}
            </p>
            <ul className="grid gap-2 text-sm md:text-base text-gray-600 leading-snug flex-1 w-full text-left list-none pl-0">
                {items.map((item, index) => (
                    <li key={index} className="break-words flex gap-2">
                        <span className="text-border-accent flex-shrink-0">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
            {description && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-sm md:text-base text-gray-600 leading-snug w-full text-left">
                    {description}
                </p>
            )}
            {children && (
                <div className="mt-3 pt-3 border-t border-gray-100 w-full">
                    {children}
                </div>
            )}
        </div>
    </div>
);

export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
            </div>

            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <div className="mb-12">
                    <SectionHeader title="Vision" underline={true} size="small" />

                    <div className="max-w-3xl mx-auto text-center">
                        <blockquote className="text-lg md:text-xl text-gray-900 italic leading-relaxed tracking-tight mb-6">
                            Unifying Graph & Language Intelligence toward <span className="highlight">knowledge-driven AI</span>, enabling human-like reasoning for the future of AGI.
                        </blockquote>
                    </div>
                </div>

                {/* Approaches Section */}
                <div className="mb-12">
                    <SectionHeader title="Approaches" underline={true} size="small" />

                    <div className="space-y-4 md:space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            {researchData.approaches.slice(0, 2).map((approach, index) => (
                                <ResearchSection
                                    key={index}
                                    title={approach.title}
                                    items={approach.items}
                                    description={approach.description}
                                />
                            ))}
                        </div>
                        <div className="max-w-2xl mx-auto">
                            <ResearchSection
                                title={researchData.approaches[2].title}
                                items={researchData.approaches[2].items}
                                description={researchData.approaches[2].description}
                            >
                                <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                                    <a
                                        href="/pdf/Graph-based AI_part1_v251028.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-[13px] md:text-[15px] font-medium rounded-lg shadow-sm hover:shadow transition duration-200"
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Graph-based AI (Part 1)
                                    </a>
                                    <a
                                        href="/pdf/Graph-based AI_part2_v251104.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-[13px] md:text-[15px] font-medium rounded-lg shadow-sm hover:shadow transition duration-200"
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Graph-based AI (Part 2)
                                    </a>
                                </div>
                            </ResearchSection>
                        </div>
                    </div>
                </div>

                {/* Applications Section */}
                <div className="mb-12">
                    <SectionHeader title="Applications" underline={true} size="small" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {researchData.applications.map((application, index) => (
                            <ResearchSection
                                key={index}
                                title={application.title}
                                items={application.items}
                                description={application.description}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}