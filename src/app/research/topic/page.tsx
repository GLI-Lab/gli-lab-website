import {getMetadata} from "@/lib/GetMetadata";
import {Metadata} from "next";
import {Breadcrumb} from "@/components/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: `Research Topic`,
  });
};

export default function Page() {
  return (
    <div className="flex h-screen flex-col items-center text-center">
      <div className="mt-6 md:mt-10 text-gray-600 text-[14px]">
        You are here: <Breadcrumb/>
      </div>

      <div className="mt-16 text-left px-3 md:text-gb">
        <p className="text-lg mb-4">Our research fields are as follows:</p>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Knowledge Representation with Deep Learning</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Knowledge Graph Embedding and Completion</li>
              <li>Reliable Knowledge Graph Path Representation Learning</li>
              <li>Context-aware Relational Learning for Knowledge Graphs</li>
              <li>Open-World Knowledge Graph Completion for Unseen Entities and Relations</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">NLP with Deep Learning & Knowledge Graphs</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Knowledge Injection for Conversational Recommender System</li>
              <li>Persona-Grounded Response Generation with Commonsense Knowledge</li>
              <li>Empathetic Response Generation via Recognizing Emotional Feature Transitions</li>
              <li>Active Learning for Information Extraction from Unstructured Text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
)}