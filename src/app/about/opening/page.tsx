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

                    <div className="w-full rounded-lg border border-gray-200 shadow-sm p-2 md:p-4 py-3 md:py-5 flex flex-col items-center justify-center text-center space-y-8">
                        <p className="text-home">
                            We are currently seeking <span className="highlight">talented and passionate students (MS/PhD) as well as undergraduate research interns.</span> 
                            <br />
                            Please feel free to contact us at <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span> if you are interested in joining our team.
                        </p>

                        <p className="text-home">
                            우리 연구실은 <span className="highlight">LLM, 추천 시스템, 그래프 머신러닝, 지식 기반 지능형 시스템</span>을 포함한 
                            다양한 인공지능 분야의 연구를 진행하고 있습니다.
                            <br />
                            해당 주제에 관심 있는 대학원 지망생과 학부 연구생은 언제든지 문의해 주세요.
                            <br />
                            체계적인 연구역량 향상을 위해 선별된 핵심 논문 <Link href="/board/study" className="group text-brand-primary underline-offset-4 hover:underline hover:decoration-1">
                                스터디
                                <svg className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>를 통해 충분히 성장할 수 있는 기회를 제공합니다.
                        </p>

                        <div className="text-home flex flex-col text-left mb-6">
                            <p className="font-semibold mb-2">
                                [연구지원]
                            </p>
                            <ul className="list-inside list-disc space-y-2">
                                <li>최신 연구 주제 중심의 정기적인 논문 스터디 운영</li>
                                <li>연구 주제 참여 및 우수 논문 공동 저자 기회 제공</li>
                                <li>연구 성과에 따른 장려금 및 인센티브 지원</li>
                                <li>국내외 학술대회 발표 및 논문 게재 시 등록비, 출장비 지원</li>
                                <li>고성능 컴퓨팅 장비, GPU 서버, 연구용 소프트웨어 등 인프라 제공</li>
                                <li>진로 탐색 및 연구 역량 향상을 위한 맞춤형 멘토링</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
