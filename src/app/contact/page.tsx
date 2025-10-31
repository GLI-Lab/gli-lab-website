import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import {FaCheck} from "react-icons/fa";
import KakaoMap from "@/components/KakaoMap";
import Link from 'next/link';

const TITLE = `Contact`

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
  });
};

interface PageProps {
    searchParams: Promise<{ tab?: string }>
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const activeTab = params.tab || 'contact';

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                {/* <SubCover title={TITLE} showBreadcrumb={false}/> */}
                <SubCover title={TITLE} pattern="diagonal-lines-sm" colorVariant="neutral" showBreadcrumb={false}/>
            </div>

            {/* =============================== */}
            {/*             Navigation          */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-gray-50 border-b border-gray-200 px-4 md:px-6 relative z-0">
                <div className="flex justify-center">
                    <nav className="flex flex-col items-center w-full mx-auto md:flex-row md:items-center md:w-auto md:max-w-none">
                        {/* Left Divider */}
                        <div className="hidden md:block w-px bg-gray-200 self-stretch my-2"></div>
                        
                        <Link
                            href="/contact?tab=contact"
                            className={`relative w-full md:w-auto py-1.5 px-6 md:py-4 md:px-12 font-semibold text-lg md:text-xl transition-all duration-300 touch-manipulation text-center md:text-left text-gray-800 
                                ${activeTab === 'contact' ? 'animate-highlight' : 'hover:bg-slate-100'}`}
                        >
                            <span className="relative py-1 px-3">
                                Contact Information
                            </span>
                        </Link>
                        
                        {/* Responsive Divider */}
                        <div className="bg-gray-200 h-px w-full md:h-auto md:w-px md:self-stretch md:my-2"></div>
                        
                        <Link
                            href="/contact?tab=hiring"
                            className={`relative w-full md:w-auto py-1.5 px-6 md:py-4 md:px-12 font-semibold text-lg md:text-xl transition-all duration-300 touch-manipulation text-center md:text-left text-gray-800 
                                ${activeTab === 'hiring' ? 'animate-highlight' : 'hover:bg-slate-100'}`}
                        >
                            <span className="relative py-1 px-3">
                                ✨ Now Hiring (Q&A) ✨
                            </span>
                        </Link>
                        
                        {/* Right Divide */}
                        <div className="hidden md:block w-px bg-gray-200 self-stretch my-2"></div>
                    </nav>
                </div>
            </div>
                        
            {/* =============================== */}
            {/*              Contact            */}
            {/* =============================== */}
            {activeTab === 'contact' && (
                <div className="max-w-screen-2xl mx-auto bg-white">
                    <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                    py-8 md:py-16 px-4 md:px-6">
                        <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                            E-mail
                        </p>

                        <ul className="list-none list-inside space-y-4 md:space-y-8 text-left text-home">
                            <li className="flex space-x-2">
                                <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                <span><span className="font-semibold pr-2">교수#1: </span>bkoh@konkuk.ac.kr</span>
                            </li>
                            <li className="flex space-x-2">
                                <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                <span><span className="font-semibold pr-2">교수#2: </span>bkoh509@gmail.com</span>
                            </li>
                        </ul>

                        <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                            Location
                        </p>

                        <ul className="list-none list-inside space-y-4 md:space-y-8 text-left text-home">
                            <li className="flex space-x-2">
                                <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                <span><span className="font-semibold pr-2">주소:</span>05029 서울시 광진구 능동로 120</span>
                            </li>
                            <li className="flex space-x-2">
                                <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                <span><span
                                    className="font-semibold pr-2">교수실:</span>공학관C동 384-2호</span>
                            </li>
                            <li className="flex space-x-2">
                                <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                                <span><span className="font-semibold pr-2">연구실:</span>신공학관 1220호/1221호</span>
                            </li>
                        </ul>

                        <KakaoMap />
                    </div>
                </div>
            )}

            {/* =============================== */}
            {/*               채용              */}
            {/* =============================== */}
            {activeTab === 'hiring' && (
                <div className="max-w-screen-2xl mx-auto bg-white">
                    <div className="max-w-screen-lg mx-auto py-8 md:py-16 px-4 md:px-6 space-y-12 text-left">
                       <p className="">
                            We are currently seeking <span className="highlight">talented and passionate graduate students (MS/PhD) 
                            as well as undergraduate research interns.</span> If you are interested in joining our team, 
                            please contact us at <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span> with CV, research interests, and motivation for joining our lab.
                            <br /><br />
                            본 연구실은 <span className="highlight">그래프를 활용한 지식기반 지능형 시스템</span>을 핵심적으로 연구하고 있습니다. 
                            그래프는 복잡한 데이터와 지식 간의 관계/규칙/제약사항 등을 명확하게 표현하고 탐색하는 핵심 기술로, 
                            딥러닝 모델의 해석 가능성과 신뢰성을 크게 향상시킬 수 있습니다. 
                            이를 통해 <span className="highlight">자연어처리, 추천시스템, 이상탐지 등 다양한 딥러닝 응용 분야</span>에서 기존 기술의 한계를 극복하고, 
                            데이터와 지식을 효과적으로 통합하여 보다 정교하고 제어 가능한 추론과 의사결정 능력을 제공합니다.
                            <br /><br />
                            해당 주제에 관심 있는 대학원 지망생과 학부 연구생은 <span className="underline">간단한 이력서(CV), 연구 관심분야(Research Interests), 연구실 지원 동기(Motivation for joining our lab)</span>를 포함하여 언제든지 <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span>로 문의해 주세요.
                            체계적인 연구역량 향상을 위해 선별된 핵심 논문 <Link href="/board/study" className="group text-brand-primary underline-offset-4 hover:underline hover:decoration-1">
                                스터디
                                <svg className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>를 통해 충분히 성장할 수 있는 기회를 제공합니다.
                        </p>

                        <div className="space-y-2">
                            <div className="font-semibold text-brand-primary text-section">연구지원</div>
                            <ul className="list-disc ml-6 space-y-2">
                                <li>최신 연구 주제 중심의 정기적인 논문 스터디 운영</li>
                                <li>연구 주제 참여 및 우수 논문 공동 저자 기회 제공</li>
                                <li>연구 성과에 따른 장려금 및 인센티브 지원</li>
                                <li>국내외 학술대회 발표 및 논문 게재 시 등록비, 출장비 지원</li>
                                <li>고성능 컴퓨팅 장비, GPU 서버, 연구용 소프트웨어 등 인프라 제공</li>
                                <li>진로 탐색 및 연구 역량 향상을 위한 맞춤형 멘토링</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <div className="font-semibold text-brand-primary text-section">Culture & Philosophy</div>
                            {/* <p className="mb-4">
                                Our lab focuses on research-oriented activities in computer science and artificial intelligence, primarily targeting top-tier conferences such as WWW, CIKM, WSDM, KDD, AAAI, and ACL. 
                                Rather than pursuing a large-scale lab, I prioritize maintaining a <span className="underline">manageable team size that allows for meaningful, personalized mentorship</span>. 
                                I conduct individual lab meetings with each student 1-2 times per week, ensuring close guidance and support tailored to their research progress and goals.
                            </p>
                            <p className="mb-8">
                                I believe that it is essential to build a <span className="underline">passionate atmosphere in our lab, where all members can inspire and motivate one another</span>. 
                                The growth of each individual directly contributes to the collective growth of our team, enabling us to achieve even more than we thought possible. 
                                Personally, I feel deeply motivated and inspired by witnessing the personal and professional growth of our lab members. 
                                I warmly welcome undergraduate and graduate students who share this passion and are eager to embrace ambitious challenges, actively contributing to our lab's culture. 
                                As your mentor and fellow team member, I promise to fully support your growth.
                            </p> */}
                            <p className="">
                                우리 연구실은 인공지능 및 데이터 마이닝 분야에서 연구 중심의 활동을 목표로 하며, WWW, CIKM, WSDM, KDD, AAAI, ACL, EMNLP 등의 탑티어 학회를 최우선 목표로 합니다. 
                                거대한 규모의 연구실을 지향하기보다는, <span className="underline">실질적으로 밀착된 지도가 가능한 적정 규모</span>를 우선시합니다. 
                                이를 통해 각 대학원생과 주 1~2회의 개별 랩미팅을 진행하며, 연구의 전 과정에서 구체적인 피드백과 지원을 제공합니다.
                            </p>
                            <p className="">
                                저는 연구실에서 <span className="underline">열정적인 분위기 속에서 서로가 영감과 동기를 나눌 수 있는 환경을 만드는 것이 무엇보다 중요</span>하다고 생각합니다. 
                                각 연구실 구성원의 성장은 곧 팀 전체의 성장으로 이어지고, 이러한 선순환을 통해 처음 생각했던 것보다 훨씬 더 큰 성취를 이룰 수 있다고 믿습니다. 
                                저 또한 구성원 여러분이 성장하는 모습을 가까이에서 지켜보며 큰 보람과 동기를 얻고 있습니다. 
                                이러한 문화를 함께 만들어 갈 열정과 도전정신을 지닌 학부연구생과 대학원생 여러분을 진심으로 환영합니다. 
                                교수이자 동시에 팀의 일원으로서, 여러분의 성장을 돕기 위해 최선을 다하겠습니다.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="font-semibold text-brand-primary text-section">Roles & Expectations</div>
                            <p className="">
                                우리 연구실에서는 학부생과 대학원생을 3~4명 단위로 구성하여 교수 주도형 기초 학술 스터디를 운영하고, 대학원생-학부생 간 매칭을 통해 함께 연구개발을 수행합니다. 
                                이를 통해 <span className="underline">대학원생은 리더십을 향상시키고 연구 효율성을 높이며, 학부생은 실질적인 연구 경험과 학술적 역량을 쌓을 수 있습니다</span>. 
                                저는 지도교수로서 적절한 업무를 배정하고 랩미팅을 통해 진행상황을 트래킹하며, 각 구성원에게 필요한 지원과 가이드를 제공합니다. 
                                이러한 협업 환경을 통해 의미 있는 연구 성과와 함께 모든 구성원의 성장을 지원합니다.
                            </p>
                            <div className="font-medium underline pb-1">Graduate Students (MS/PhD)</div>
                            <ul className="list-disc ml-6 space-y-2">
                                <li>명확한 연구 목표 설정 및 체계적 발전</li>
                                <li>독창적이고 의미 있는 연구 주제 발굴을 통한 국제우수학술대회 및 탑티어 저널 논문 게재</li>
                                <li>국내외 우수 대학/연구기관/글로벌 산업체 공동연구 참여를 통한 전문성 확대</li>
                                <li>연구과제 및 제안서 작성 참여를 통한 연구기획 역량 향상</li>
                                <li>학위 과정 연구 종합·정리를 통한 우수 학위논문 완성</li>
                            </ul>
                            <div className="font-medium underline pb-1">Undergraduate Interns</div>
                            <ul className="list-disc ml-6 space-y-2 pb-1">
                                <li>관심 분야 능동적 탐색 및 스터디/멘토링을 통한 심도 있는 학습</li>
                                <li>관련 연구 탐색·실험·분석 수행 (하이퍼파라미터 조절, 데이터 전처리, 케이스 분석)</li>
                                <li>제1저자 국내학술대회 또는 국제학술대회/저널 논문 작성 및 투고 (학회 등록 및 출판비용 지원)</li>
                                <li>공동저자 참여를 통한 연구 역량 강화 및 진로 탐색</li>
                            </ul>
                        </div>
                    </div>
                </div>

            )}

            <div className="h-40"></div>
        </>
    )
}
