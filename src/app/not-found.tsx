import { JSX, SVGProps } from "react"
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center text-center">
      {/*<div className="mt-6 md:mt-10 text-gray-600 text-[14px]">*/}
      {/*  You are here: <Breadcrumb/>*/}
      {/*</div>*/}
      <LoaderIcon className="mt-12 md:mt-24 h-40 w-40 animate-spin text-green-800"/>
      <h1 className="mt-8 text-2xl font-bold">Coming Soon</h1>
      <h1 className="mt-4 text-4xl font-bold">콘텐츠 준비 중입니다.</h1>
      <p className="mt-4 text-lg text-gray-800">
        콘텐츠 내용이 준비가 되지 않았습니다.
        <br/>
        빠른 시일 내에 업데이트하도록 하겠습니다.
        <br/>
        감사합니다.
        <br/>
        <Link href="https://bkoh509.github.io" className="font-bold text-green-900 hover:underline underline-offset-4">
          https://bkoh509.github.io
        </Link>
      </p>
    </div>
  )
}

function LoaderIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <line x1="12" x2="12" y1="2" y2="6" />
      <line x1="12" x2="12" y1="18" y2="22" />
      <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
      <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
      <line x1="2" x2="6" y1="12" y2="12" />
      <line x1="18" x2="22" y1="12" y2="12" />
      <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
      <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
    </svg>
  )
}
