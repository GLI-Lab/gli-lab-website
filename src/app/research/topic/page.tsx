import {Metadata} from "next";
import Image from "next/image";

import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";

// import Head from 'next/head';
// import ResearchTopics from "@/components/Tooltip";

const TITLE = `Research Topic`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
    });
};


export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE}/>
            </div>

            <div className="max-w-screen-xl mx-auto px-5 py-10">
                <p className="text-header">Summary</p>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="flex flex-col items-center text-left mb-6">
                    <div className="space-y-6">
                        <p className="text-body">
                            Our research fields are as follows:
                        </p>
                        <p className="text-accent">
                            <span className="highlight">&lt;Approaches&gt;</span>
                        </p>
                        <div>
                            <p className="text-accent mb-2">
                                Graph Representation Learning
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Graph Neural Networks (GNNs) for Node/Edge/Graph Embedding</li>
                                <li>Knowledge Graph Representation/Completion/Validation/Construction</li>
                                <li>Context-Aware Knowledge Graph Representation and Relational Learning</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-accent mb-2">
                                Large Language Models (LLMs)
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Multi-Modal & Knowledge-Enhanced Foundation Models</li>
                                <li>Knowledge & LLM Distillation for Efficient Model Development</li>
                                <li>Advanced Prompt Engineering: Chain-of-Thought (CoT), and Retrieval-Augmented
                                    Generation (RAG)
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-accent mb-2">
                                Synergizing LLMs and Graphs
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Text-to-Graph & Graph-to-Text Generation</li>
                                <li>Graph-Structured Interaction for LLMs (GraphRAG, Graph-driven LLM Agents)</li>
                                <li>Knowledge-grounded & Context-aware Response Generation with LLMs</li>
                            </ul>
                        </div>
                        <p className="text-accent">
                            <span className="highlight">&lt;Applications&gt;</span>
                        </p>
                        <div>
                            <p className="text-accent mb-2">
                                Natural Language Processing (NLP)
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Question Answering, Information Retrieval & Extraction</li>
                                <li>Document Analysis (Sentiment, Opinion, Topic, NER, Summarization)</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-accent mb-2">
                                Recommender Systems
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Knowledge-enhanced & Explainable Recommendations</li>
                                <li>Conversational & Graph-based Recommendations</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-accent mb-2">
                                Graph Analytics and Prediction
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Node & Graph Classification Tasks</li>
                                <li>Link Prediction and Knowledge Graph Completion</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/*<ResearchTopics/>*/}

                <p className="text-header">Poster</p>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="space-y-6">
                    <Image src="/topic/poster1.webp" alt="poster1" width={1600} height={2000}
                           className="h-full w-full object-cover"/>
                    <Image src="/topic/poster2.webp" alt="poster2" width={1600} height={2000}
                           className="h-full w-full object-cover"/>
                </div>
            </div>
        </>
    )
}