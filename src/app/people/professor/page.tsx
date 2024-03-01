import {getMetadata} from "@/lib/GetMetadata";
import {Metadata} from "next";
import {Breadcrumb} from "@/components/Breadcrumb";
import {JSX, SVGProps} from "react";
import Image from "next/image";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: `Research Topic`,
  });
};

export default function Page() {
  return (
    <div className="flex h-screen flex-col items-center text-center">
      <div className="mt-10 text-gray-600 text-[14px]">
        You are here: <Breadcrumb/>
      </div>

      <div className="mt-16 text-left">
        <h2 className="text-xl font-semibold">FACULTY</h2>
        <div className="flex flex-col space-y-8 pt-6">
          <div className="flex space-x-6">
            <Image alt="Byungkook Oh" className="rounded-xl" height="250" width="250" src="/professor.jpg" />
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold">Byungkook Oh (오병국)</h3>
                <p className="">Assistant professor</p>
                <p className="">Department of Computer Science and Engineering (CSE)</p>
                <p className="">Konkuk University, Seoul, Korea</p>
                <p className="">Research Interest</p>
                <p className=""> - Knowledge Representation</p>
                <p className=""> - Knowledge-enhanced NLP Applications</p>
                <p className=""> - Information Retrieval & Recommendation</p>
              </div>
              <div className="space-y-1">
                <p className="">bkoh at konkuk.ac.kr, bkoh509 at gmail.com</p>
              </div>
              <div className="flex space-x-2">
                <TextIcon className="text-gray-600"/>
                <DatabaseIcon className="text-gray-600"/>
                <GraduationCapIcon className="text-gray-600"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DatabaseIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
      <path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
  )
}


function GraduationCapIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}


function TextIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 6.1H3"/>
      <path d="M21 12.1H3"/>
      <path d="M15.1 18H3"/>
    </svg>
  )
}