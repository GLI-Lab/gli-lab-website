import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import Link from "next/link";

const TITLE = `Opening`

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

            {/* =============================== */}
            {/*               채용              */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Now Hiring ✨
                    </p>

                    <p className="text-home">We are currently seeking <span className="highlight">talented and passionate students (MS/PhD) as well as undergraduate research interns</span>.
                        <br /> 
                        Please feel free to contact us <span
                            className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span> if you are interested in our
                        research.</p>

                    <p className="text-home">LLM, 추천시스템, 그래프 머신러닝과 지식 기반의 지능형 시스템에 관심이 있는 대학원 지망생과 학부연구생은 언제든지 연락 주시기 바랍니다. 
                        <br />
                        선별된 핵심 논문 <Link href="/board/study" className="group text-brand-primary underline-offset-4 hover:underline hover:decoration-1">
                        스터디
                            <svg className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>를 통해 충분히 성장가능합니다.</p>
                    
                    <div className="text-home flex flex-col text-left mb-6">
                        <p className="font-semibold mb-2">
                            [연구지원]
                        </p>
                        <ul className="list-inside list-disc space-y-2">
                            <li>정기적인 논문 스터디 및 우수논문 작성/참여 기회 제공</li>
                            <li>학술적 성과에 따른 추가 장려금 지원</li>
                            <li>논문 게재료 및 국내외 학술대회 참석 지원</li>
                            <li>연구 장비 및 소프트웨어 사용 지원</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
