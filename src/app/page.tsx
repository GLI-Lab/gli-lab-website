import Image from "next/image";
import Link from 'next/link';

import { MainCover } from "@/components/Covers";
import { FaCheck } from "react-icons/fa";


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
                        Our research focuses on developing AI/DL algorithms and applications for various domains, including
                        knowledge representation (e.g., knowledge graph embedding and graph embedding) and knowledge-based
                        applications (e.g., Knowledge-enhanced NLP Applications, Information Retrieval & Recommendation),
                        with a wide range of data types (e.g., matrix/tensor, text, graph, time series).
                    </p>
                    <p className="text-home">
                        저희는 다양한 데이터 유형(예: 행렬/텐서, 텍스트, 그래프, 시계열)의 지식 표현(예: 지식 그래프 임베딩 및 그래프 임베딩)과 지식 기반 애플리케이션(예: 지식 강화 NLP 애플리케이션, 정보 검색 및 추천)을 포함한 다양한 도메인을 위한 AI/DL 알고리즘 및 애플리케이션 개발에 중점을 두고 연구하고 있습니다.
                    </p>
                    <p className="text-home">
                        <span className="underline underline-offset-4"><span className="highlight">그래프</span>는 다양한 형태와 다양한 소스의 데이터 간의 연결 관계를 의미론적으로 구조화하여 표현</span>할 수 있습니다.
                        반면, <span className="underline underline-offset-4"><span className="highlight">텍스트</span>는 지식 전달 및 공유를 위한 데이터로 방대한 지식과 정보를
                        담고</span>있지만, 의미 있는 정보를 추출/분석할 수 있어야 합니다. 해외 빅테크 기업들은 이미 자사들의 핵심 사업분야에서 검색/추천/추론 서비스 고도화를 위해,
                        그래프와 텍스트 데이터를 유기적으로 활용하고 있습니다.
                        본 연구실에서는 텍스트와 이미지와 같은 비정형 데이터로부터 그래프 형태의 아이템, 사용자, 상식, 멀티모달 등에 대한 관계지식을 추출합니다.
                        이러한 관계지식을 융합/탐색/활용하여 새로운 정보를 추론하거나 사용자 의도 및 선호 파악 등에 활용합니다.
                        <span className="highlight">궁극적으로는 추천시스템, 질의응답, 정보검색, 관계추출 등에 그래프 구조의 정형 데이터와 텍스트와 같은 비정형 데이터를 유기적으로 활용하여 지식기반 지능형 시스템을 연구개발</span>하는 것을 목적으로 합니다.
                    </p>
                </div>
            </div>

            {/* =============================== */}
            {/*            연구 영역            */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-[#f4f4f4]">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Explore Our Research Topic
                    </p>

                    <ul className="list-none list-inside space-y-4 md:space-y-8 text-left text-home">
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">그래프 머신러닝:</span>그래프 표현학습/완성/검증/구축, 그래프 뉴럴네트워크(GNNs)</span>
                        </li>
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">추천시스템:</span>협업필터링, 대화형 추천시스템, 유저/아이템 클러스터링</span>
                        </li>
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">자연어처리:</span>질의응답, 정보검색, 관계추출, 언어모델</span>
                        </li>
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <span><span className="font-semibold pr-2">지식 기반 시스템:</span>그래프 기반 자연어처리/추천시스템, 심볼릭 기반 설명가능성</span>
                        </li>
                    </ul>
                    <Link href='/research/topic' className="px-6 py-2 mt-12 bg-green-800 hover:bg-[#f4f4f4] border-2 border-green-800 hover:text-green-800 text-white font-semibold rounded-lg shadow-lg transition duration-300">
                        Read More
                    </Link>
                </div>
            </div>

            {/* =============================== */}
            {/*               Image             */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <Image src="/key_research.png" alt="research topics" width="1100" height="500"/>
                </div>
            </div>

            {/* =============================== */}
            {/*               채용              */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-[#f4f4f4]">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Now Hiring ✨
                    </p>

                    <p className="text-home">We are currently seeking <span className="highlight">talented and passionate students (MS/PhD) as well as undergraduate research interns</span>.
                        Please feel free to contact us <span
                            className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span> if you are interested in our
                        research.</p>

                    <p className="text-home">그래프 머신러닝과 지식 기반의 지능형 시스템에 관심이 있는 대학원 지망생과 학부연구생은 언제든지 연락 주시기 바랍니다.</p>
                </div>
            </div>

            <div className="h-40"></div>

        </div>
    )
}