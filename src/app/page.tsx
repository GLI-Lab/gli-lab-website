// import Image from "next/image";
import Link from 'next/link';

import { MainCover } from "@/components/Covers";
import { FaCheck } from "react-icons/fa";
import { NewsList } from "@/components/News";


export default function Page() {
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
                    <p className="text-home">
                        We strive for technological innovation across various real-world applications
                        such as explainable and conversational recommendations, information retrieval and extraction,
                        and trustworthy response generation.
                        To achieve this, we actively research and develop advanced methods including Graph Neural
                        Networks (GNNs),
                        multimodal and knowledge-enhanced Large Language Models (LLMs), Synergizing LLMs and Graphs
                        techniques,
                        GraphRAG, and LLM-based agents, aiming toward knowledge-enhanced intelligent systems.
                    </p>
                    <p className="text-home">
                        <span className="underline underline-offset-4"><span className="highlight">그래프</span>는
                        다양한 형태와 여러 소스에서 수집된 데이터 간의 연결 관계를 의미론적으로 구조화</span>하여 관계 중심으로 표현할 수 있습니다.
                        <span className="underline underline-offset-4"><span className="highlight">텍스트</span>는
                        인간의 방대하고 잠재적인 지식과 정보</span>를 담고있지만, 이로부터 의미 있는 정보를 추출/분석할 수 있어야합니다.
                        이미 글로벌 빅테크 기업들은 자사의 핵심 사업 분야인 검색/추천/개인화/추론 서비스 고도화를 위해
                        그래프와 텍스트 데이터를 유기적으로 융합하여 활용하고 있습니다.
                    </p>
                    <p className="text-home">
                        본 연구실은 텍스트 및 이미지와 같은 멀티모달 비정형 데이터뿐만 아니라 행렬·텐서·그래프·시계열과 같은 다양한 형태의 데이터를 활용하여,
                        아이템·사용자·상식·도메인 지식 등의 관계지식을 그래프 형태로 구조화하고 이를 표현하는 연구를 수행하고 있습니다.
                        이러한 관계지식을 다양한 모델(ex, 언어모델 및 추천시스템)과 융합하여 사용자 의도, 선호, 사실정보 등을 더욱 정확히 반영하고자 합니다.

                        궁극적으로 설명가능한 추천, 대화형 추천, 정보 검색 및 추출, 신뢰할 수 있는 응답 생성 등 다양한 실세계 응용 분야에서 기술 혁신을 도전합니다.
                        이를 위해 <span className="highlight">그래프 뉴럴네트워크(GNNs), 멀티모달 및 지식 기반 LLMs, 그래프와 LLM의 융합 기술,
                        GraphRAG, LLM 에이전트 등 지식기반 지능형 시스템을 위한 최신 기술들을 연구개발</span>하고 있습니다.
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

                    <ul className="list-none list-inside space-y-4 md:space-y-8 text-left text-home">
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">자연어처리:</span>질의응답, 정보 검색/추출, 지식/LLM 증류</span>
                        </li>
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span
                                className="font-semibold pr-2">추천시스템:</span>지식기반/설명가능한 추천, 멀티모달/대화형 추천, 그래프 기반 추천</span>
                        </li>
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">그래프 표현학습:</span>그래프 뉴럴네트워크(GNNs), 지식그래프 표현/완성/검증/구축</span>
                        </li>
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">LLM·그래프 융합:</span>지식기반/멀티모달 LLM, 텍스트-그래프 변환, LLM 에이전트, GraphRAG</span>
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
                        <ul className="list-inside list-disc space-y-2">
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
