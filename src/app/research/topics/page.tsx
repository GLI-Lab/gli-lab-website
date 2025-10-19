import Image from "next/image";

import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";

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

                    <div className="rounded-lg border border-gray-200 shadow-sm p-3 md:p-5 overflow-hidden">
                        <div className="space-y-6">
                            {/* Approaches Section */}
                            <div>
                                <SectionHeader title="Approaches" />
                                <div className="grid gap-3 md:gap-4">
                                    {researchData.approaches.map((approach, index) => (
                                        <ResearchSection 
                                            key={index}
                                            title={approach.title}
                                            items={approach.items}
                                            bgColor="bg-slate-100"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Applications Section */}
                            <div>
                                <SectionHeader title="Applications" />
                                <div className="grid gap-3 md:gap-4">
                                    {researchData.applications.map((application, index) => (
                                        <ResearchSection 
                                            key={index}
                                            title={application.title}
                                            items={application.items}
                                            bgColor="bg-slate-100"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*<ResearchTopics/>*/}

                {/* Poster Section */}
                <div>
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
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}