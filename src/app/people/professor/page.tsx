import {getMetadata} from "@/lib/GetMetadata";
import {Metadata} from "next";
import { SubCover } from "@/components/Covers";
import IframeWrapper from "@/components/legacy/IframeWrapper";
import Head from 'next/head';


export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: `Professor`,
    });
};

export default function Page() {
    return (
        // bg-[#f7f7f7]
        <div className="max-w-[1600px] mx-auto">
            <SubCover title="Student"/>
            <IframeWrapper />

            {/*<div className="mt-8 text-left">*/}
            {/*  <h2 className="ml-4 text-xl font-semibold">Professor</h2>*/}
            {/*  <div className="flex flex-col md:flex-row items-center space-y-8 space-x-6 pt-6 md:pt-2">*/}
            {/*    <Image alt="Byungkook Oh" className="rounded-xl h-[200px] w-[200px]" height="200" width="200"*/}
            {/*           src="/_professor.jpg"/>*/}
            {/*    <div className="">*/}
            {/*      <h3 className="text-lg font-semibold">Byungkook Oh (오병국)</h3>*/}
            {/*      <p>Assistant _professor</p>*/}
            {/*      <p>Department of Computer Science and Engineering (CSE)</p>*/}
            {/*      <p>Konkuk University, Seoul, Korea</p>*/}
            {/*      <p>Research Interest</p>*/}
            {/*      <p> - Knowledge Representation</p>*/}
            {/*      <p> - Knowledge-enhanced NLP Applications</p>*/}
            {/*      <p> - Information Retrieval & Recommendation</p>*/}
            {/*      <p>bkoh at konkuk.ac.kr, bkoh509 at gmail.com</p>*/}
            {/*      <div className="mt-2 flex space-x-2">*/}
            {/*        <TextIcon className="text-gray-600"/>*/}
            {/*        <DatabaseIcon className="text-gray-600"/>*/}
            {/*        <GraduationCapIcon className="text-gray-600"/>*/}
            {/*      </div>*/}
            {/*      <Link href="https://bkoh509.github.io"*/}
            {/*            className="font-bold text-green-900 hover:underline underline-offset-4">*/}
            {/*        https://bkoh509.github.io*/}
            {/*      </Link>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}

        </div>
    )
}

// function DatabaseIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <ellipse cx="12" cy="5" rx="9" ry="3"/>
//       <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
//       <path d="M3 12A9 3 0 0 0 21 12"/>
//     </svg>
//   )
// }
//
//
// function GraduationCapIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
//       <path d="M6 12v5c3 3 9 3 12 0v-5"/>
//     </svg>
//   )
// }
//
//
// function TextIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M17 6.1H3"/>
//       <path d="M21 12.1H3"/>
//       <path d="M15.1 18H3"/>
//     </svg>
//   )
// }