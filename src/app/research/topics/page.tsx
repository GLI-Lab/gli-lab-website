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

const researchData = {
    approaches: [
        {
            title: "Graph Intelligence (그래프 표현학습)",
            items: [
                "Graph Neural Networks for Node, Edge, and Graph-level Representation",
                "Knowledge Graph Completion, Validation, and Construction",
                "Context-Aware Relational Learning on Heterogeneous/Dynamic Graphs"
            ],
            description: "Graph Intelligence는 노드, 엣지, 서브그래프 등 다양한 레벨에서 복잡한 관계와 구조를 표현하고 분석합니다. 이를 위해, 그래프 신경망(GNN), 지식그래프 임베딩 등 딥러닝 기반 그래프 표현학습 방법론을 심층 탐구합니다."
        },
        {
            title: "Language Intelligence (대형 언어모델)",
            items: [
                "Knowledge Integration and Reasoning Capabilities of LLM Agents",
                "Knowledge & LLM Distillation for Lightweight, Efficient Intelligence",
                "Advanced Prompt Engineering: Chain-of-Thought (CoT), and Retrieval-Augmented Generation (RAG)"
            ],
            description: "Language Intelligence는 대규모 텍스트로부터 언어의 의미와 맥락을 깊이 이해하고, 일관된 추론과 생성을 가능하게 합니다. 이를 위해, 멀티모달·지식 증강 파운데이션 모델과 CoT, RAG 등 고급 프롬프트 전략을 연구합니다."
        },
        {
            title: "Graph-Language Fusion (그래프·언어모델 통합)",
            items: [
                "Text-to-Graph and Graph-to-Text Generation",
                "Graph-Structured Interaction for LLMs: GraphRAG and Graph-Driven Agents",
                "Knowledge-Grounded and Context-Aware Response Generation",
                "LLM-Powered Graph Agents and NL-to-Graph Query"
            ],
            description: "Graph-Language Fusion은 그래프의 구조적 지식과 언어모델의 생성·추론 능력을 결합하여, 더 신뢰할 수 있는 AI를 구현합니다. 이를 위해, GraphRAG, Graph-driven Agent 등 그래프 구조를 활용한 LLM 상호작용과 지식 기반 응답 생성 방법론을 연구합니다."
        }
    ],
    applications: [
        {
            title: "Graph-Centric AI (그래프 분석·예측)",
            items: [
                "Node and Graph Classification, Link Prediction, and Graph Generation",
                "Knowledge Graph Construction and Quality Assurance",
                "Predictive Analytics and Intelligent Monitoring on Graph-Structured Data"
            ],
            description: "노드·링크·그래프 수준의 분류와 예측을 통해 복잡한 네트워크 데이터를 실제 문제에 적용합니다. 지식그래프 구축·검증·확장 및 다양한 딥러닝 모델과의 통합을 통해 관계 기반 의사결정을 지원합니다."
        },
        {
            title: "Language-Centric AI (자연어처리)",
            items: [
                "Question Answering, Information Retrieval, and Extraction",
                "Document Analysis: Sentiment, Opinion, Topic, NER, and Summarization",
                "LLM-Driven Insight Discovery and Automated Decision Making"
            ],
            description: "질의응답, 정보 검색·추출, 문서 분석 등 핵심 자연어처리 태스크를 다양한 도메인에 적용합니다. LLM의 환각을 줄이고 근거 있는 응답을 생성하기 위한 지식 증강 및 모델 경량화 기법을 함께 탐구합니다."
        },
        {
            title: "Recommender Systems (추천시스템)",
            items: [
                "Learned Representations and Encoders for Retrieval and Personalization",
                "Knowledge-enhanced and Explainable Recommendations",
                "Multimodal and Conversational Recommendations",
            ],
            description: "사용자–아이템-지식 그래프를 확장해 사용자의 의도와 맥락을 반영하여 설명 가능하고 정확한 추천을 구현합니다. 멀티모달 정보와 대화형 인터페이스를 활용해 사용자 선호를 보다 깊이 이해하는 추천 시스템을 연구합니다."
        },
        {
            title: "Anomaly Detection (이상탐지)",
            items: [
                "Network and Graph-based Anomaly Detection",
                "User Behavior Modeling and Profiling for Anomaly Identification",
                "Multimodal Anomaly Detection"
            ],
            description: "네트워크 구조, 사용자 행동, 멀티모달 데이터 등 다양한 소스를 활용하여 이상 패턴을 탐지합니다. 행위 간 상관관계와 맥락 정보를 반영함으로써 기존 방법으로는 포착하기 어려운 복합적 이상을 식별합니다."
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
    wide = false,
    emphasized = false,
    bgColor = "bg-white" 
}: { 
    title: string; 
    items: string[]; 
    description?: string;
    children?: React.ReactNode;
    wide?: boolean;
    emphasized?: boolean;
    bgColor?: string; 
}) => (
    <div className={`${emphasized ? "bg-brand-primary/[0.04]" : bgColor} p-4 md:p-5 overflow-hidden h-full flex flex-col rounded-xl border border-gray-200 shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200}`}>
        <div className={`flex flex-col items-center text-center mx-auto w-full ${wide ? "max-w-2xl" : "max-w-xl"}`}>
            <p className={`text-lg md:text-xl font-semibold leading-snug break-words mb-4 md:mb-5 w-full text-brand-primary `}>
                {titleWithNowrapParens(title)}
            </p>
            <ul className="grid gap-2 text-[14.5px] md:text-[16.5px] text-gray-600 leading-normal flex-1 w-full text-left list-none pl-0">
                {items.map((item, index) => (
                    <li key={index} className="break-words flex gap-2">
                        <span className="text-border-accent flex-shrink-0">•</span>
                        <span>{item}</span> 
                    </li>
                ))}
            </ul>
            {description && (
                <p className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-gray-200 text-[14.5px] md:text-[16.5px] text-gray-600 leading-normal w-full text-left">
                    {description}
                </p>
            )}
            {children && (
                <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-gray-200 w-full">
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

                    <div className="mx-auto text-center">
                        <blockquote className="text-lg md:text-xl font-normal text-gray-900 italic leading-relaxed tracking-tight mb-6">
                            Unifying Graph & Language Intelligence toward <span className="highlight">knowledge-driven AI</span>, enabling human-like reasoning for the future of AGI.
                        </blockquote>
                        <div className="w-12 h-0.5 bg-brand-primary mx-auto my-6" />
                        <p className="text-[16px] md:text-[18px] text-gray-800 tracking-tight leading-relaxed max-w-5xl mx-auto">
                            We aim to overcome the limitations of conventional deep learning by unifying Graph Intelligence and Language Intelligence 
                            <br className="hidden md:block" /> — structuring real-world data through graphs and capturing human language insight through language models.
                        </p>
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
                        <div className="max-w-[50rem] mx-auto">
                            <ResearchSection
                                title={researchData.approaches[2].title}
                                items={researchData.approaches[2].items}
                                description={researchData.approaches[2].description}
                                wide
                                emphasized
                            >
                                <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center items-center">
                                    <a
                                        href="/pdf/Graph-based AI_part1_v251028.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-2 bg-white text-sm md:text-base font-medium hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg shadow hover:shadow-md transition duration-200"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Graph-based AI (Part 1)
                                    </a>
                                    <a
                                        href="/pdf/Graph-based AI_part2_v251104.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-2 bg-white text-sm md:text-base font-medium hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg shadow hover:shadow-md transition duration-200"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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