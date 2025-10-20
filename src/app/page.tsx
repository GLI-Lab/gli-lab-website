// import Image from "next/image";
import Link from 'next/link';

import { MainCover } from "@/components/Covers";
import { FaCheck } from "react-icons/fa";
import { NewsList } from "@/components/News";
import { getNews } from "@/data/loaders/newsLoader";
import { getMemberIds, getAlumniIds } from "@/data/loaders/profileLoader";

export default async function Page() {
    // 뉴스와 프로필 ID 리스트 데이터 로딩
    const newsItems = await getNews();
    const memberIds = await getMemberIds();
    const alumniIds = await getAlumniIds();

    return (
        <div className="">
            <div className="max-w-screen-2xl mx-auto">
                <MainCover/>
            </div>

            {/* =============================== */}
            {/*              개요               */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <h2 className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        About GLI Lab.
                    </h2>
                    <div className="md:py-4 text-center">
                        <div className="inline-block relative hover:scale-105 transition-all duration-300">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-25 hover:opacity-40 transition-opacity duration-300"></div>
                            <div className="relative bg-white px-4 py-3 md:px-8 md:py-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300">
                                <p className="text-[17px] sm:text-[18px] md:text-[18.5px] lg:text-[19px] xl:text-[20px] font-medium italic">
                                    " I pursue <Link href="https://www.youtube.com/watch?v=y7sXDpffzQQ&ab_channel=IBMTechnology" 
                                    className="group text-brand-primary underline-offset-4 hover:underline transition-colors">knowledge<svg className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg></Link>-driven AI
                                    capable of human-like thinking because it is vital to the future of AGI "
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-home">
                        We strive for technological innovation across various real-world applications 
                        such as explainable and conversational recommendations, information retrieval and extraction, and trustworthy response generation.
                        To achieve this, we actively research and develop advanced methods including Graph Neural Networks (GNNs),
                        multimodal and knowledge-enhanced Large Language Models (LLMs), Synergizing LLMs and Graphs techniques,
                        GraphRAG, and LLM-based agents, aiming toward knowledge-enhanced intelligent systems.
                    </p>
                    <p className="text-home">
                        <span className="underline underline-offset-4"><span className="highlight">그래프</span>는
                        다출처 데이터와 지식 간의 관계, 규칙, 제약사항 등을 명확하게 구조화하고 잠재적 지식을 탐색</span>할 수 있습니다.
                        <span className="underline underline-offset-4"><span className="highlight">텍스트</span>는
                        인간의 방대한 지식과 정보</span>를 담고있지만, 이로부터 의미 있는 정보를 추출/분석할 수 있어야합니다.
                        이미 글로벌 빅테크 기업들은 자사의 핵심 사업 분야인 검색/추천/개인화/추론/탐지 서비스 고도화를 위해
                        그래프와 텍스트 데이터를 유기적으로 융합하여 활용하고 있습니다.
                    </p>
                    <p className="text-home">
                        이에 본 연구실에서는 자연어처리, 컴퓨터비전, 이상탐지 등 전통적인 딥러닝 모델이 가지는 한계점을 극복하고자 합니다. 
                        기존 딥러닝 방법론과 그래프 기반 접근을 유기적으로 융합하여, <span className="underline underline-offset-4">지식 중심(Knowledge-driven)의 추론 가능한 AI를 
                        구현하기 위한 <span className="highlight">그래프 기반 딥러닝의 원천기술</span>을 다방면으로 연구개발</span>하는 것을 목표로 합니다.
                        
                    </p>
                    <p className="text-home">
                        구체적으로, 텍스트와 이미지 같은 비정형 멀티모달 데이터뿐만 아니라, 행렬, 시계열, 그래프 등 다양한 데이터로부터 
                        아이템 속성, 사용자 프로필, 도메인 지식, 상식, 제약 정보 등의 관계지식을 그래프 형태로 구조화하고, 이를 지속적으로 확장합니다. 
                        또한, 언어모델(LLMs), 추천시스템, 이상탐지 등 다양한 딥러닝 기술에 그래프 기반 딥러닝을 융합하여, 
                        사용자 의도와 선호, 사실 정보 등을 정밀하게 반영하고, <span className="underline underline-offset-4">높은 신뢰성, 유연한 확장성, 설명 가능성</span>을 갖춘 기술을 연구개발하고자 합니다.
                    </p>
                </div>
            </div>

            {/* =============================== */}
            {/*            연구 영역            */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-gray-100">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Explore Our Research Topic
                    </p>

                    <p className="text-home">
                        본 연구실은 궁극적으로 자연어처리, 추천시스템, 그래프 표현학습, LLM-그래프 융합, 이상탐지에서 
                        다음과 같은 최신 기술들을 연구개발하고 있습니다.
                    </p>

                    <ul className="list-none list-inside space-y-6 md:space-y-10 text-left text-home">
                        <li className="space-y-2 leading-snug">
                            <div className="space-y-1">
                                <div className="flex space-x-2">
                                    <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                    <span><span className="font-semibold underline underline-offset-4">자연어처리</span>: 질의응답, 정보 검색/추출, 지식/LLM 증류 및 응용</span>
                                </div>
                            </div>
                            <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                → 그래프 지식을 통합하여 LLM의 환각 문제를 줄이고, 더 일관된 응답 생성 가능
                            </div>
                        </li>
                        <li className="space-y-2 leading-snug">
                            <div className="space-y-1">
                                <div className="flex space-x-2">
                                    <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                    <span><span className="font-semibold underline underline-offset-4">추천시스템</span>: 지식기반/설명가능한 추천, 멀티모달/대화형 추천, 그래프 기반 추천</span>
                                </div>
                            </div>
                            <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                → 그래프 기반의 사용자–아이템 관계 확장을 통해 의도와 맥락 중심의 추천 가능
                            </div>
                        </li>
                        <li className="space-y-2 leading-snug">
                            <div className="space-y-1">
                                <div className="flex space-x-2">
                                    <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                    <span><span className="font-semibold underline underline-offset-4">그래프 표현학습</span>: 그래프 뉴럴네트워크(GNNs), 지식그래프 표현/완성/검증/구축
                                    </span>
                                </div>
                            </div>
                            <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                → 그래프 구축/확장 및 다양한 딥러닝 모델과의 통합을 위한 기반 기술로 활용 가능
                            </div>
                        </li>
                        <li className="space-y-2 leading-snug">
                            <div className="space-y-1">
                                <div className="flex space-x-2">
                                    <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                    <span><span className="font-semibold underline underline-offset-4">LLM–그래프 융합</span>: 지식기반/멀티모달 LLM, 텍스트-그래프 변환, LLM 에이전트, GraphRAG</span>
                                </div>
                            </div>
                            <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                → 그래프를 통해 LLM에 외부 지식을 입력하여 신뢰성 높고 도메인 특화 응답 생성 가능
                            </div>
                        </li>
                        <li className="space-y-2 leading-snug">
                            <div className="space-y-1">
                                <div className="flex space-x-2">
                                    <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                    <span><span className="font-semibold underline underline-offset-4">이상탐지</span>: 네트워크/그래프 이상탐지, 사용자 행동 기반 이상탐지, 멀티모달 이상탐지</span>
                                </div>
                            </div>
                            <div className="ml-6 text-gray-600 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                → 그래프를 통해 행위 간의 상관관계를 모델링하여 상황 맥락에 맞는 이상 탐지 가능
                            </div>
                        </li>
                    </ul>
                    <Link href='/research/topic'
                          className="px-6 py-2 mt-12 bg-green-800 hover:bg-[#f4f4f4] border-2 border-green-800 hover:text-green-800 text-white font-semibold rounded-lg shadow-lg transition duration-300">
                        Read More
                    </Link>
                </div>
            </div>

            {/* =============================== */}
            {/*                뉴스             */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Latest News
                    </p>
                    <NewsList 
                        className="w-full text-home text-left"
                        count={30}
                        newsItems={newsItems}
                        memberIds={memberIds}
                        alumniIds={alumniIds}
                    />
                    <Link href='/board/news'
                        className="px-6 py-2 mt-12 bg-green-800 hover:bg-[#f4f4f4] border-2 border-green-800 hover:text-green-800 text-white font-semibold rounded-lg shadow-lg transition duration-300">
                        Read More
                    </Link>
                </div>
            </div>

            {/* =============================== */}
            {/*               채용              */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-gray-100">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Now Hiring ✨
                    </p>

                    <p className="text-home">
                        We are currently seeking <span className="highlight">talented and passionate students (MS/PhD) as well as undergraduate research interns.</span> 
                        {' '}<br className="hidden md:inline" />
                        Please feel free to contact us at <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span> if you are interested in joining our team.
                    </p>

                    <p className="text-home">
                        본 연구실은 <span className="highlight">그래프를 활용한 지식기반 지능형 시스템</span>을 핵심적으로 연구하고 있습니다. 
                        {' '}<br className="hidden md:inline" />
                        그래프는 복잡한 데이터와 지식 간의 관계/규칙/제약사항 등을 명확하게 표현하고 탐색하는 핵심 기술로, 
                        {' '}<br className="hidden md:inline" />
                        딥러닝 모델의 해석 가능성과 신뢰성을 크게 향상시킬 수 있습니다.
                        {' '}<br className="hidden md:inline" />
                        이를 통해 <span className="highlight">자연어처리, 추천시스템, 이상탐지 등 다양한 딥러닝 응용 분야</span>에서 기존 기술의 한계를 극복하고,
                        {' '}<br className="hidden md:inline" />
                        데이터와 지식을 효과적으로 통합하여 보다 정교하고 제어 가능한 추론과 의사결정 능력을 제공합니다.
                    </p>

                    <p className="text-home">
                        해당 주제에 관심 있는 대학원 지망생과 학부 연구생은 언제든지 <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span>로 문의해 주세요.
                        {' '}<br className="hidden md:inline" />
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
                        <ul className="list-disc ml-6 space-y-2">
                            <li>최신 연구 주제 중심의 정기적인 논문 스터디 운영</li>
                            <li>연구 주제 참여 및 우수 논문 공동 저자 기회 제공</li>
                            <li>연구 성과에 따른 장려금 및 인센티브 지원</li>
                            <li>국내외 학술대회 발표 및 논문 게재 시 등록비, 출장비 지원</li>
                            <li>고성능 컴퓨팅 장비, GPU 서버, 연구용 소프트웨어 등 인프라 제공</li>
                            <li>진로 탐색 및 연구 역량 향상을 위한 맞춤형 멘토링</li>
                        </ul>
                    </div>

                    <Link href='/contact?tab=hiring'
                        className="px-6 py-2 bg-green-800 hover:bg-[#f4f4f4] border-2 border-green-800 hover:text-green-800 text-white font-semibold rounded-lg shadow-lg transition duration-300">
                        Read More
                    </Link>
                </div>
            </div>

            <div className="h-20"></div>

        </div>
    )
}
