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
                        We strive for technological innovation across various real-world applications
                        such as explainable and conversational recommendations, information retrieval and extraction,
                        and trustworthy response generation.
                        To achieve this, we actively research and develop advanced methods including Graph Neural Networks (GNNs),
                        multimodal and knowledge-enhanced Large Language Models (LLMs), Synergizing LLMs and Graphs techniques,
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

            <div className="h-40"></div>
        </>
    )
}
