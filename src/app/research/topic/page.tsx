import {Metadata} from "next";
import Image from "next/image";

import {getMetadata} from "@/lib/GetMetadata";
import Subcover from "@/components/Subcover";


export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: `Research Topic`,
    });
};


export default function Page() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <Subcover pos="Research Topic"/>

            <div className="max-w-screen-xl mx-auto px-5 py-10">
                <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">Summary</h2>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="flex flex-col items-center text-left px-3 md:text-gb mb-6">
                    <div className="space-y-4">
                        <p className="text-[16.5px] lg:text-[18px]">Our research fields are as follows:</p>
                        <div>
                            <h2 className="text-[18px] lg:text-[20px] font-semibold mb-2">Knowledge Representation with
                                Deep Learning</h2>
                            <ul className="text-[15px] lg:text-[16px] list-inside list-disc space-y-1">
                                <li>Knowledge Graph Embedding and Completion</li>
                                <li>Reliable Knowledge Graph Path Representation Learning</li>
                                <li>Context-aware Relational Learning for Knowledge Graphs</li>
                                <li>Open-World Knowledge Graph Completion for Unseen Entities and Relations</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-[18px] lg:text-[20px] font-semibold mb-2">NLP with Deep Learning &
                                Knowledge Graphs</h2>
                            <ul className="text-[15px] lg:text-[16px] list-inside list-disc space-y-1">
                                <li>Knowledge Injection for Conversational Recommender System</li>
                                <li>Persona-Grounded Response Generation with Commonsense Knowledge</li>
                                <li>Empathetic Response Generation via Recognizing Emotional Feature Transitions
                                </li>
                                <li>Active Learning for Information Extraction from Unstructured Text</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">Poster</h2>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="space-y-6">
                    <Image src="/topic/poster1.webp" alt="poster1" width={1600} height={2000} className="h-full w-full object-cover"/>
                    <Image src="/topic/poster2.webp" alt="poster2" width={1600} height={2000} className="h-full w-full object-cover"/>
                </div>
            </div>
        </div>
    )
}