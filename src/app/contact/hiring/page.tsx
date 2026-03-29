import { Metadata } from "next";
import Link from "next/link";

import { getMetadata } from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";

const TITLE = "✨ Now Hiring (Q&A) ✨";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
  });
};


export default function Page() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover
          title={TITLE}
          pattern="diagonal-lines"
          colorVariant="sage"
          showBreadcrumb={false}
        />
      </div>
      
      <div className="max-w-screen-2xl mx-auto bg-white">
        <div className="max-w-screen-lg mx-auto py-8 md:py-16 px-4 md:px-6 space-y-12 text-left">
          {/* 소개 */}
          <p>
            We are currently seeking talented and passionate graduate students (MS/PhD) as well as undergraduate research interns.
            If you are interested in joining our team, please contact us at{" "}
            <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span>{" "}
            with CV, research interests, and motivation for joining our lab.
            <br />
            <br />
            본 연구실은{" "}
            <span className="highlight">
              그래프를 활용한 지식기반 지능형 시스템
            </span>
            을 핵심적으로 연구하고 있습니다. 그래프는 복잡한 데이터와 지식 간의
            관계, 규칙, 제약사항 등을 명확하게 표현하고 탐색하는 핵심 기술로,
            딥러닝 모델의 해석 가능성과 신뢰성을 크게 향상시킬 수 있습니다.
            특히, 자연어처리나 컴퓨터비전처럼 독립적으로 발전해 온 도메인들을
            그래프 및 관계 지식이라는 통합적 틀로 엮어냄으로써, 도메인 간의
            시너지를 창출하고 기존 기술의 한계를 극복하는 것을 지향합니다. 이를
            통해 추천시스템, 이상탐지 등 다양한 딥러닝 응용 분야에서 데이터와
            지식을 효과적으로 통합하여 보다 정교하고 제어 가능한 추론과
            의사결정 능력을 제공합니다. 특히 소규모 연구실의 장점을 살려
            주 1~2회 개별 랩미팅과 밀착 지도를 제공하여, 규모 대비 우수한
            연구실적을 달성하고 있습니다.
            <br />
            <br />
            해당 주제에 관심 있는 대학원 지망생과 학부 연구생은{" "}
            <span className="underline">
              간단한 이력서(CV), 연구 관심분야(Research Interests), 연구실 지원
              동기(Motivation for joining our lab)
            </span>
            를 포함하여 언제든지{" "}
            <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span>
            로 문의해 주세요. 체계적인 연구역량 향상을 위해 선별된 핵심 논문{" "}
            <Link
              href="/board/study"
              className="group text-brand-primary underline-offset-4 hover:underline hover:decoration-1"
            >
              스터디
              <svg
                className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
            를 통해 충분히 성장할 수 있는 기회를 제공합니다.
          </p>

          {/* How We Research */}
          <div className="space-y-4">
            <div className="font-semibold text-brand-primary text-section">
              How We Research
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 연구실의 주요 목표는 무엇인가요?</p>
              <p>
              하나의 좁은 도메인만 깊이 파기보다는, 다양한 도메인에 knowledge-driven 방법론을 폭넓게 적용하는 것을 지향합니다. 비유하자면 <span className="underline">송곳보다는 압정</span>에 가깝습니다. 
              <span className="underline">AI 분야는 하나의 기술이 다양한 문제에 응용될 수 있어야 진정한 가치를 발휘하기 때문</span>입니다. 
              이를 위해 WWW, CIKM, WSDM, KDD, AAAI, ACL, EMNLP 등 인공지능 및 데이터 마이닝 분야 탑티어 학회 논문 게재와 학생별 연구개발과제 리딩 1회 이상을 구체적인 목표로 삼고 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 지향하는 연구실 규모는 어느 정도인가요?</p>
              <p>
                거대한 규모보다는 <span className="underline">소수의 역량 있는 구성원과의 긴밀한 소통</span>을 최우선으로 합니다. 대형 연구실에서는 교수와의 심층적인 디스커션이 어려운 경우가 많은데, 
                대학원생 10명 미만의 적정 규모를 유지함으로써 각 대학원생과 주 1~2회 개별 랩미팅을 진행하고, 연구의 전 과정에서 구체적인 피드백과 밀착 지도를 제공합니다. 
                이를 통해 모든 구성원이 핵심 인재로 성장하는 것을 목표로 합니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 개발과 연구 중 어디에 더 비중을 두나요?</p>
              <p>
                어느 한쪽만 강조하기보다는 두 가지를 함께 키워나가는 것을 중요하게
                생각합니다. 이를 위해 각 구성원이 탑티어 학회 논문을 게재할 수 있도록
                밀착 지도하고, 산업체 과제를 최소 1회 이상 직접 리딩하는 경험을 할 수
                있도록 지원합니다. 졸업 후 산업체로 가든 연구를 계속하든, 어느 쪽을
                선택하더라도 경쟁력을 갖출 수 있도록 하는 것이 목표입니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 연구만 해서는 취업이 어렵지 않나요?</p>
              <p>
                오히려 연구를 제대로 하려면 개발 능력이 자연스럽게 따라옵니다. 논문
                하나를 완성하기까지 모델 설계 및 구현, 실험 환경 구축, 성능 분석까지
                직접 해내야 하기 때문입니다. 여기에 더해, AI 시대에는 단순히 코드를
                잘 짜는 것을 넘어 문제를 정의하고 최적의 방법론을 찾아내는 능력이
                점점 더 중요해지고 있습니다. 이런 실무 경쟁력은 연구 과정에서
                자연스럽게 습득되기에 취업에도 도움이 됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 지원하려면 어떤 사전 지식이 필요한가요?</p>
              <p>
                딥러닝 기초와 Python 활용 능력이 있다면 충분합니다. 그래프나 지식
                표현에 대한 경험이 없더라도, 입학 전후로 제공되는 핵심 논문 스터디와
                멘토링을 통해 단계적으로 익힐 수 있습니다. 특정 도메인(자연어처리, 컴퓨터비전 등)의
                경험보다 새로운 분야를 능동적으로 학습하려는 태도를 더 중요하게 봅니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 졸업 후 어떤 진로를 기대할 수 있나요?</p>
              <p>
                연구실에서 쌓은 탑티어 논문 게재 경험과 산업체 과제 리딩 경험은
                학계와 산업계 양쪽 모두에서 강점이 됩니다. 대학/연구기관에서 연구를
                이어가고 싶은 분에게는 독립적인 연구 역량이, 산업체로 가고 싶은
                분에게는 실무 역량이 갖춰지도록 지도하고 있습니다. 구성원 각자가
                원하는 방향으로 나아갈 수 있도록 최선을 다하겠습니다.
              </p>
            </div>
          </div>

          {/* Culture & Philosophy */}
          <div className="space-y-4">
            <div className="font-semibold text-brand-primary text-section">
              Culture & Philosophy
            </div>
            <p>
            저는 연구실에서 열정적인 분위기 속에서 <span className="underline">서로가 영감과 동기를 나눌 수 있는 환경</span>을 만드는 것이 무엇보다 중요하다고 생각합니다. 
            각 연구실 구성원의 성장은 곧 팀 전체의 성장으로 이어지고, 이러한 선순환을 통해 처음 생각했던 것보다 훨씬 더 큰 성취를 이룰 수 있다고 믿습니다. 
            </p>

            <div className="space-y-2">
              <p className="font-semibold">Q: 출퇴근 시간이 정해져 있나요?</p>
              <p>
                오후 코어 시간대를 제외하면 출퇴근 시간은 자유롭게 운영하고 있습니다.
                각자 가장 집중이 잘 되는 시간대가 다르다고 생각하기 때문입니다. 다만,
                랩미팅이나 스터디 등 공동 일정이 있는 경우에는 필수적으로
                참여해야 합니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 인건비는 어떻게 지급되나요?</p>
              <p>
                연구실 상황에 맞게 등록금에 해당하는 기본 인건비를 최대한 보장하고
                있으며, 과제 리딩이나 논문 작성 등 연구 기여도에 따라 추가로 차등
                지급합니다. 노력한 만큼 보상받을 수 있는 구조를 만들려고 합니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Q: 연구 주제는 어떻게 정해지나요?</p>
              <p>
              연구실의 큰 방향성 안에서, 각자가 관심 있는 분야를 탐색하고 본인이 하고 싶은 주제를 직접 선택할 수 있도록 자율성을 드립니다. 특정 주제를 일방적으로 강제하기보다는,  저는 구성원이 주제를 찾아가는 과정에서 방향성을 함께 논의하고, 연구가 구체화될 수 있도록 돕는 역할을 합니다.
              </p>
            </div>

            <p>
            저 또한 구성원 여러분이 성장하는 모습을 가까이에서 지켜보며 큰 보람을 느끼고 있습니다. 
            실제로 저희 연구실은 규모 대비 우수한 연구실적을 꾸준히 달성하고 있습니다.
            이러한 문화를 함께 만들어 갈 열정과 도전정신을 지닌 학부연구생과 대학원생 여러분을 진심으로 환영합니다. 
            교수이자 동시에 팀의 일원으로서, 여러분의 성장을 돕기 위해 최선을 다하겠습니다.
            </p>
          </div>

          {/* Roles & Expectations */}
          <div className="space-y-2">
            <div className="font-semibold text-brand-primary text-section">
              Roles & Expectations
            </div>
            <p>
              우리 연구실에서는 학부생과 대학원생을 3~4명 단위로 구성하여 교수
              주도형 기초 학술 스터디를 운영하고, 대학원생-학부생 간 매칭을 통해
              함께 연구개발을 수행합니다. 이를 통해{" "}
              <span className="underline">
                대학원생은 리더십을 향상시키고 연구 효율성을 높이며, 학부생은
                실질적인 연구 경험과 학술적 역량을 쌓을 수 있습니다
              </span>
              . 저는 지도교수로서 적절한 업무를 배정하고 랩미팅을 통해 진행상황을
              트래킹하며, 각 구성원에게 필요한 지원과 가이드를 제공합니다. 이러한
              협업 환경을 통해 의미 있는 연구 성과와 함께 모든 구성원의 성장을
              지원합니다.
            </p>
            <div className="font-medium underline pb-1">
              Graduate Students (MS/PhD)
            </div>
            <ul className="list-disc ml-6 space-y-2">
              <li>명확한 연구 주제를 입학 전에 설정하고 체계적으로 발전</li>
              <li>
                독창적 방법론 연구를 통한 국제우수학술대회 및 탑티어 저널 논문 게재
              </li>
              <li>
                국내외 우수 대학/연구기관/글로벌 산업체 공동연구 참여를 통한
                전문성 확대
              </li>
              <li>연구과제 및 제안서 작성 참여를 통한 연구기획 역량 향상</li>
            </ul>
            <div className="font-medium underline pb-1">
              Undergraduate Interns
            </div>
            <ul className="list-disc ml-6 space-y-2 pb-1">
              <li>관심 분야 능동적 탐색 및 스터디/멘토링을 통한 심도 있는 학습</li>
              <li>
                관련 연구 탐색·실험·분석 수행 (하이퍼파라미터 조절, 데이터
                전처리, 케이스 분석)
              </li>
              <li>
                제1저자 국내학술대회 또는 국제학술대회/저널 논문 작성 및 투고
                (학회 등록 및 출판비용 지원)
              </li>
              <li>논문 공동저자 참여를 통한 연구 역량 강화 및 진로 탐색</li>
            </ul>
          </div>

          {/* 연구지원 */}
          <div className="space-y-2">
            <div className="font-semibold text-brand-primary text-section">
              연구지원
            </div>
            <ul className="list-disc ml-6 space-y-2">
              <li>최신 연구 주제 중심의 정기적인 논문 스터디 운영</li>
              <li>연구 주제 참여 및 우수 논문 공동 저자 기회 제공</li>
              <li>연구 성과에 따른 장려금 및 인센티브 지원</li>
              <li>
                국내외 학술대회 발표 및 논문 게재 시 등록비, 출장비 지원
              </li>
              <li>
                고성능 컴퓨팅 장비, GPU 서버, 연구용 소프트웨어 등 인프라 제공
              </li>
              <li>진로 탐색 및 연구 역량 향상을 위한 맞춤형 멘토링</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="h-40" />
    </>
  );
}


// import { Metadata } from "next";
// import Link from "next/link";

// import { getMetadata } from "@/lib/GetMetadata";
// import { SubCover } from "@/components/Covers";

// const TITLE = "✨ Now Hiring (Q&A) ✨";

// export const generateMetadata = async (): Promise<Metadata> => {
//   return getMetadata({
//     title: TITLE,
//   });
// };


// export default function Page() {
//   return (
//     <>
//       <div className="max-w-screen-2xl mx-auto">
//         <SubCover
//           title={TITLE}
//           pattern="diagonal-lines"
//           colorVariant="sage"
//           showBreadcrumb={false}
//         />
//       </div>
      
//       <div className="max-w-screen-2xl mx-auto bg-white">
//         <div className="max-w-screen-lg mx-auto py-8 md:py-16 px-4 md:px-6 space-y-12 text-left">
//           <p>
//             We are currently seeking{" "}
//             <span className="highlight">
//               talented and passionate graduate students (MS/PhD) as well as
//               undergraduate research interns.
//             </span>{" "}
//             If you are interested in joining our team, please contact us at{" "}
//             <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span>{" "}
//             with CV, research interests, and motivation for joining our lab.
//             <br />
//             <br />
//             본 연구실은{" "}
//             <span className="highlight">
//               그래프를 활용한 지식기반 지능형 시스템
//             </span>
//             을 핵심적으로 연구하고 있습니다. 그래프는 복잡한 데이터와 지식 간의
//             관계/규칙/제약사항 등을 명확하게 표현하고 탐색하는 핵심 기술로,
//             딥러닝 모델의 해석 가능성과 신뢰성을 크게 향상시킬 수 있습니다. 이를
//             통해{" "}
//             <span className="highlight">
//               자연어처리, 추천시스템, 이상탐지 등 다양한 딥러닝 응용 분야
//             </span>
//             에서 기존 기술의 한계를 극복하고, 데이터와 지식을 효과적으로 통합하여
//             보다 정교하고 제어 가능한 추론과 의사결정 능력을 제공합니다.
//             <br />
//             <br />
//             해당 주제에 관심 있는 대학원 지망생과 학부 연구생은{" "}
//             <span className="underline">
//               간단한 이력서(CV), 연구 관심분야(Research Interests), 연구실 지원
//               동기(Motivation for joining our lab)
//             </span>
//             를 포함하여 언제든지{" "}
//             <span className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span>
//             로 문의해 주세요. 체계적인 연구역량 향상을 위해 선별된 핵심 논문{" "}
//             <Link
//               href="/board/study"
//               className="group text-brand-primary underline-offset-4 hover:underline hover:decoration-1"
//             >
//               스터디
//               <svg
//                 className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//                 />
//               </svg>
//             </Link>
//             를 통해 충분히 성장할 수 있는 기회를 제공합니다.
//           </p>

//           <div className="space-y-2">
//             <div className="font-semibold text-brand-primary text-section">
//               연구지원
//             </div>
//             <ul className="list-disc ml-6 space-y-2">
//               <li>최신 연구 주제 중심의 정기적인 논문 스터디 운영</li>
//               <li>연구 주제 참여 및 우수 논문 공동 저자 기회 제공</li>
//               <li>연구 성과에 따른 장려금 및 인센티브 지원</li>
//               <li>
//                 국내외 학술대회 발표 및 논문 게재 시 등록비, 출장비 지원
//               </li>
//               <li>
//                 고성능 컴퓨팅 장비, GPU 서버, 연구용 소프트웨어 등 인프라 제공
//               </li>
//               <li>진로 탐색 및 연구 역량 향상을 위한 맞춤형 멘토링</li>
//             </ul>
//           </div>

//           <div className="space-y-2">
//             <div className="font-semibold text-brand-primary text-section">
//               Culture & Philosophy
//             </div>
//             <p>
//               우리 연구실은 인공지능 및 데이터 마이닝 분야에서 연구 중심의
//               활동을 목표로 하며, WWW, CIKM, WSDM, KDD, AAAI, ACL, EMNLP 등의
//               탑티어 학회를 최우선 목표로 합니다. 거대한 규모의 연구실을
//               지향하기보다는,{" "}
//               <span className="underline">
//                 실질적으로 밀착된 지도가 가능한 적정 규모
//               </span>
//               를 우선시합니다. 이를 통해 각 대학원생과 주 1~2회의 개별 랩미팅을
//               진행하며, 연구의 전 과정에서 구체적인 피드백과 지원을 제공합니다.
//             </p>
//             <p>
//               저는 연구실에서{" "}
//               <span className="underline">
//                 열정적인 분위기 속에서 서로가 영감과 동기를 나눌 수 있는 환경을
//                 만드는 것이 무엇보다 중요
//               </span>
//               하다고 생각합니다. 각 연구실 구성원의 성장은 곧 팀 전체의 성장으로
//               이어지고, 이러한 선순환을 통해 처음 생각했던 것보다 훨씬 더 큰
//               성취를 이룰 수 있다고 믿습니다. 저 또한 구성원 여러분이 성장하는
//               모습을 가까이에서 지켜보며 큰 보람과 동기를 얻고 있습니다. 이러한
//               문화를 함께 만들어 갈 열정과 도전정신을 지닌 학부연구생과 대학원생
//               여러분을 진심으로 환영합니다. 교수이자 동시에 팀의 일원으로서,
//               여러분의 성장을 돕기 위해 최선을 다하겠습니다.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <div className="font-semibold text-brand-primary text-section">
//               Roles & Expectations
//             </div>
//             <p>
//               우리 연구실에서는 학부생과 대학원생을 3~4명 단위로 구성하여 교수
//               주도형 기초 학술 스터디를 운영하고, 대학원생-학부생 간 매칭을 통해
//               함께 연구개발을 수행합니다. 이를 통해{" "}
//               <span className="underline">
//                 대학원생은 리더십을 향상시키고 연구 효율성을 높이며, 학부생은
//                 실질적인 연구 경험과 학술적 역량을 쌓을 수 있습니다
//               </span>
//               . 저는 지도교수로서 적절한 업무를 배정하고 랩미팅을 통해 진행상황을
//               트래킹하며, 각 구성원에게 필요한 지원과 가이드를 제공합니다. 이러한
//               협업 환경을 통해 의미 있는 연구 성과와 함께 모든 구성원의 성장을
//               지원합니다.
//             </p>
//             <div className="font-medium underline pb-1">
//               Graduate Students (MS/PhD)
//             </div>
//             <ul className="list-disc ml-6 space-y-2">
//               <li>명확한 연구 목표 설정 및 체계적 발전</li>
//               <li>
//                 독창적이고 의미 있는 연구 주제 발굴을 통한 국제우수학술대회 및
//                 탑티어 저널 논문 게재
//               </li>
//               <li>
//                 국내외 우수 대학/연구기관/글로벌 산업체 공동연구 참여를 통한
//                 전문성 확대
//               </li>
//               <li>연구과제 및 제안서 작성 참여를 통한 연구기획 역량 향상</li>
//               <li>학위 과정 연구 종합·정리를 통한 우수 학위논문 완성</li>
//             </ul>
//             <div className="font-medium underline pb-1">
//               Undergraduate Interns
//             </div>
//             <ul className="list-disc ml-6 space-y-2 pb-1">
//               <li>관심 분야 능동적 탐색 및 스터디/멘토링을 통한 심도 있는 학습</li>
//               <li>
//                 관련 연구 탐색·실험·분석 수행 (하이퍼파라미터 조절, 데이터
//                 전처리, 케이스 분석)
//               </li>
//               <li>
//                 제1저자 국내학술대회 또는 국제학술대회/저널 논문 작성 및 투고
//                 (학회 등록 및 출판비용 지원)
//               </li>
//               <li>공동저자 참여를 통한 연구 역량 강화 및 진로 탐색</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       <div className="h-40" />
//     </>
//   );
// }
