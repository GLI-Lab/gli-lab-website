import { Metadata } from "next";
import { IoStar } from "react-icons/io5";

import { getMetadata } from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";

const TITLE = "Resources";
const PATHNAME = "/board/resources";

const LINK_CLASS =
  "group underline-offset-4 hover:underline hover:decoration-1.5 hover:text-brand-primary";

type ResourceItem = {
  title: string;
  description: string;
  url: string;
  recommended?: boolean;
};

const CONFERENCE_RESOURCES: ResourceItem[] = [
  {
    title: "CS 분야 우수 학술대회 목록",
    description:
      "한국정보과학회·BK21·KAIST/SNU/POSTECH 기준을 한 표로 비교한 비공식 정리. 국내에서 학회 급을 빠르게 볼 때 쓰입니다.",
    url: "https://gist.github.com/Pusnow/6eb933355b5cb8d31ef1abcb3c3e1206",
    recommended: true,
  },
  {
    title: "한국정보과학회 우수학술대회 목록",
    description:
      "정보과학회가 제정한 공식 최우수/우수 학술대회 목록과 보고서입니다. 2024년 기준 최우수 73, 우수 143개입니다.",
    url: "https://www.kiise.or.kr/academy/main/getContent.fa?MENU_ID=130500&content_no=86",
  },
  {
    title: "ICORE Conference Rankings",
    description:
      "호주 CORE에서 이어진 국제 CS 학회 등급(A*, A, B, C)입니다. 위원회가 인용·채택률 등을 보고 몇 년마다 갱신합니다.",
    url: "https://portal.core.edu.au/conf-ranks/",
  },
  {
    title: "CCF 추천 국제학술회의 목록",
    description:
      "중국컴퓨터학회(CCF) 추천 디렉터리 7판(2026). 분야별로 학회를 A/B/C로 나눕니다. 저널 목록도 같은 페이지에 있습니다.",
    url: "https://www.ccf.org.cn/Academic_Evaluation/By_category/",
  },
  {
    title: "CSConfStats",
    description:
      "주요 CS 학회의 연도별 투고 수와 채택률 통계입니다. 순위표가 아니라 학회 난이도를 가늠할 때 씁니다.",
    url: "https://csconfstats.xoveexu.com/",
  },
  {
    title: "Research.com Conference Rankings",
    description:
      "h-index와 주요 연구자 참여를 합친 Impact Score로 CS 학회를 나열합니다. 인용량 중심이라 공식 등급과는 다를 수 있습니다.",
    url: "https://research.com/conference-rankings/computer-science",
  },
  {
    title: "CSRankings",
    description:
      "선택 학회 출판 편수로 세계 CS 기관을 매기는 지표입니다. 어떤 학회가 분야별로 인정되는지도 함께 볼 수 있습니다.",
    url: "https://csrankings.org/#/index?all&kr",
  },
];

const DEADLINE_RESOURCES: ResourceItem[] = [
  {
    title: "CCF Deadlines",
    description:
      "CCF 추천 학회 중심으로 마감을 모은 트래커입니다. 분야 필터와 카운트다운을 제공하고, 업데이트가 가장 활발합니다.",
    url: "https://ccfddl.com/",
    recommended: true,
  },
  {
    title: "CS Deadlines",
    description:
      "CSRankings에 들어가는 주요 CS 학회의 논문 마감을 카운트다운으로 보여 줍니다.",
    url: "https://cs-deadlines.cin.ufpe.br/",
  },
  {
    title: "AI Deadlines",
    description:
      "ML, NLP, 데이터마이닝, 지식표현, 정보검색 등 AI 계열 학회 마감입니다. 캘린더로 보내기도 됩니다.",
    url: "https://aideadlin.es/",
  },
  {
    title: "Conference List",
    description:
      "DB, WWW, NLP, DM, IR, AI, ML 등 CS 학회의 초록·투고·발표 일정을 큐레이션합니다.",
    url: "https://conferencelist.info/upcoming/",
  },
  {
    title: "CSConfs",
    description:
      "CSRankings 학회와 CORE 등급을 함께 필터해 마감을 추적합니다. 관심 학회만 골라 보기 좋습니다.",
    url: "https://roars.dev/csconfs/?csrankings=AAAI,IJCAI,CVPR,ECCV,ICCV,ICLR,ICML,KDD,NeurIPS,ACL,EMNLP,NAACL,SIGIR,WWW&core=NeurIPS,SENSYS,KDD,MOBICOM,SIGIR,ACMMM,PODC,ACL,COLT,EMNLP,ECCV,CVPR,INFOCOM,ICCV,ICDM,PERCOM,SP,ISMAR,IPSN,ICAPS,ICLR,ICML,KR,EuroCrypt,IJCAI,AAMAS,WWW,AAAI,USENIX-Security",
  },
];

const JOURNAL_RESOURCES: ResourceItem[] = [
  {
    title: "LetPub",
    description:
      "중국에서 만든 SCI 투고 조회입니다. 영향력 지수, JCR/중과원 구역, 게재 난이도, 심사 기간을 한 화면에서 볼 수 있습니다.",
    url: "https://www.letpub.com.cn/index.php?page=journalapp",
    recommended: true,
  },
  {
    title: "CrushSCI",
    description:
      "실제 논문의 투고–게재 날짜로 심사 일수를 집계합니다. JCR 분위(Q1–Q4)와 중과원 구역도 함께 표시됩니다.",
    url: "https://www.crushsci.com/",
  },
  {
    title: "MedSci 期刊查询",
    description:
      "영향력 지수, 투고 합격률, 심사 주기를 조회하는 중국 사이트입니다. 일부 상세 수치는 회원만 볼 수 있습니다.",
    url: "https://www.medsci.cn/sci/index.do",
  },
  {
    title: "SciRev",
    description:
      "연구자가 남긴 1차 심사 기간, desk reject 속도, 전체 처리 시간, 심사 난이도 평가입니다.",
    url: "https://scirev.org/",
  },
  {
    title: "Journal Clock",
    description:
      "PubMed에 올라온 투고일·게재일로 저널별 실제 채택까지 걸린 일수를 측정합니다. 광고된 심사 기간이 아닙니다.",
    url: "https://www.gradsummit.com/tools/journal-clock/",
  },
];

function ExternalIcon() {
  return (
    <svg
      className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function ResourceLink({
  item,
  className = "",
}: {
  item: ResourceItem;
  className?: string;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${LINK_CLASS} ${className}`}
    >
      {item.title}
      <ExternalIcon />
    </a>
  );
}

function ResourceSection({
  title,
  items,
}: {
  title: string;
  items: ResourceItem[];
}) {
  const recommended = items.find((item) => item.recommended);
  const others = items.filter((item) => !item.recommended);

  return (
    <section className="w-full rounded-xl border border-gray-200 p-4 md:p-6">
      <h2 className="font-semibold text-brand-primary text-section mb-4">
        {title}
      </h2>

      {recommended && (
        <div className="rounded-lg bg-brand-primary/10 px-3 py-2.5 space-y-1">
          <p className="flex items-start gap-2 leading-snug">
            <IoStar
              className="mt-1 shrink-0 text-brand-primary"
              size={16}
              role="img"
              aria-label="추천"
            />
            <ResourceLink item={recommended} className="font-medium" />
          </p>
          <p className="pl-6 text-gray-600 text-sm md:text-base">
            {recommended.description}
          </p>
        </div>
      )}

      {others.length > 0 && (
        <ul className={`space-y-3 ${recommended ? "mt-4" : ""}`}>
          {others.map((item) => (
            <li key={item.url} className="leading-snug">
              <ResourceLink item={item} />
              <p className="text-gray-600 text-sm mt-0.5">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
    description:
      "Conference rankings, deadlines, and journal evaluation resources from GLI Lab",
    asPath: PATHNAME,
  });
};

export default async function Page() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover title={TITLE} pathname={PATHNAME} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
      </div>

      <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12 space-y-6 md:space-y-8">
        <ResourceSection
          title="우수 학술대회 목록"
          items={CONFERENCE_RESOURCES}
        />
        <ResourceSection
          title="학술대회 데드라인"
          items={DEADLINE_RESOURCES}
        />
        <ResourceSection
          title="저널 분류·평가"
          items={JOURNAL_RESOURCES}
        />
      </div>

      <div className="h-40"></div>
    </>
  );
}
