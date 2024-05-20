import {Metadata} from "next";
import Image from "next/image";

import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";


export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: `Research Topic`,
    });
};


export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title="Research Topic"/>
            </div>

            <div className="max-w-screen-xl mx-auto px-5 py-10">
                <p className="text-header">Summary</p>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="flex flex-col items-center text-left mb-6">
                    <div className="space-y-6">
                        <p className="text-body">
                            Our research fields are as follows:
                        </p>
                        <div>
                            <p className="text-accent mb-2">
                                Knowledge Representation with Deep Learning
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Knowledge Graph Embedding and Completion</li>
                                <li>Reliable Knowledge Graph Path Representation Learning</li>
                                <li>Context-aware Relational Learning for Knowledge Graphs</li>
                                <li>Open-World Knowledge Graph Completion for Unseen Entities and Relations</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-accent mb-2">
                                NLP with Deep Learning & Knowledge Graphs
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>Knowledge Injection for Conversational Recommender System</li>
                                <li>Persona-Grounded Response Generation with Commonsense Knowledge</li>
                                <li>Empathetic Response Generation via Recognizing Emotional Feature Transitions
                                </li>
                                <li>Active Learning for Information Extraction from Unstructured Text</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <p className="text-header">Poster</p>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="space-y-6">
                    <Image src="/topic/poster1.webp" alt="poster1" width={1600} height={2000} className="h-full w-full object-cover"/>
                    <Image src="/topic/poster2.webp" alt="poster2" width={1600} height={2000} className="h-full w-full object-cover"/>
                </div>
            </div>
        </>
    )
}