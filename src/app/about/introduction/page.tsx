import {Metadata} from "next";
import NotFound from "@/app/not-found";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";

const TITLE = `Introduction`

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
            {/*              개요               */}
            {/* =============================== */}
            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <h2 className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        About GLI Lab.
                    </h2>
                    <p className="text-home">
                        Our research focuses on developing AI/DL algorithms and applications for various domains,
                        including
                        knowledge representation (e.g., knowledge graph embedding and graph embedding) and
                        knowledge-based
                        applications (e.g., Knowledge-enhanced NLP Applications, Information Retrieval &
                        Recommendation),
                        with a wide range of data types (e.g., matrix/tensor, text, graph, time series).
                    </p>
                    <p className="text-home">
                        저희는 다양한 데이터 유형(예: 행렬/텐서, 텍스트, 그래프, 시계열)의 지식 표현(예: 지식 그래프 임베딩 및 그래프 임베딩)과 지식 기반 애플리케이션(예: 지식 강화
                        NLP 애플리케이션, 정보 검색 및 추천)을 포함한 다양한 도메인을 위한 AI/DL 알고리즘 및 애플리케이션 개발에 중점을 두고 연구하고 있습니다.
                    </p>
                    <p className="text-home">
                        <span className="underline underline-offset-4"><span className="highlight">그래프</span>는 다양한 형태와 다양한 소스의 데이터 간의 연결 관계를 의미론적으로 구조화하여 표현</span>할
                        수 있습니다.
                        반면, <span className="underline underline-offset-4"><span className="highlight">텍스트</span>는 지식 전달 및 공유를 위한 데이터로 방대한 지식과 정보를
                        담고</span>있지만, 의미 있는 정보를 추출/분석할 수 있어야 합니다. 해외 빅테크 기업들은 이미 자사들의 핵심 사업분야에서 검색/추천/추론 서비스 고도화를 위해,
                        그래프와 텍스트 데이터를 유기적으로 활용하고 있습니다.
                        본 연구실에서는 텍스트와 이미지와 같은 비정형 데이터로부터 그래프 형태의 아이템, 사용자, 상식, 멀티모달 등에 대한 관계지식을 추출합니다.
                        이러한 관계지식을 융합/탐색/활용하여 새로운 정보를 추론하거나 사용자 의도 및 선호 파악 등에 활용합니다.
                        <span className="highlight">궁극적으로는 추천시스템, 질의응답, 정보검색, 관계추출 등에 그래프 구조의 정형 데이터와 텍스트와 같은 비정형 데이터를 유기적으로 활용하여 지식기반 지능형 시스템을 연구개발</span>하는
                        것을 목적으로 합니다.
                    </p>
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
