import Image from "next/image";
import { MainCover } from "@/components/Covers";


export default function Page() {
    return (
        <div className="">
            <div className="max-w-[1600px] mx-auto">
                <MainCover/>
            </div>

            {/* =============================== */}
            {/*            연구 영역            */}
            {/* =============================== */}
            <div
                className="max-w-screen-2xl mx-auto flex flex-col items-center justify-center text-center py-6 md:py-12 px-4 md:px-6 gap-6">
                <h2 className="font-bold tracking-tighter text-[#555] text-[28px] md:text-4xl">
                    Explore Our Research Areas
                </h2>
                <p className="max-w-[1000px] text-[#555] text-base md:text-xl/relaxed">
                    Our research focuses on developing AI/DL algorithms and applications for various domains, including
                    knowledge representation (e.g., knowledge graph embedding and graph embedding) and knowledge-based
                    applications (e.g., Knowledge-enhanced NLP Applications, Information Retrieval & Recommendation),
                    with a wide range of data types (e.g., matrix/tensor, text, graph, time series).
                </p>
                <p className="max-w-[1000px] text-gray-500/85 text-base md:text-xl/relaxed">
                    저희는 다양한 데이터 유형(예: 행렬/텐서, 텍스트, 그래프, 시계열)의 지식 표현(예: 지식 그래프 임베딩 및 그래프 임베딩)과 지식 기반 애플리케이션(예: 지식 강화 NLP 애플리케이션, 정보 검색 및 추천)을 포함한 다양한 도메인을 위한 AI/DL 알고리즘 및 애플리케이션 개발에 중점을 두고 연구하고 있습니다.
                </p>
                <p className="max-w-[1000px] text-gray-500/85 text-base md:text-xl/relaxed">
                    그래프는 다양한 형태와 다양한 소스의 데이터 간의 연결 관계를 의미론적으로 구조화하여 표현할 수 있습니다. 반면, 텍스트는 지식 전달 및 공유를 위한 데이터로 방대한 지식과 정보를
                    담고있지만, 의미 있는 정보를 추출/분석할 수 있어야 합니다. 해외 빅테크 기업들은 이미 자사들의 핵심 사업분야에서 검색/추천/추론 서비스 고도화를 위해, 그래프와 텍스트 데이터를
                    유기적으로 활용하고 있습니다. 본 연구실에서는 텍스트와 이미지와 같은 비정형 데이터로부터 그래프 형태의 아이템, 사용자, 상식, 멀티모달 등에 대한 관계지식을 추출합니다. 이러한
                    관계지식을 융합/탐색/활용하여 새로운 정보를 추론하거나 사용자 의도 및 선호 파악 등에 활용합니다. 궁극적으로는 추천시스템, 질의응답, 정보검색, 관계추출 등에 활용하여 지식기반
                    지능형 시스템을 연구개발하는 것을 목적으로 합니다.
                </p>
                <Image src="/key_research.png" alt="research topics" width="1000" height="500"/>
            </div>

            {/* =============================== */}
            {/*               채용              */}
            {/* =============================== */}
            <section className="w-full py-6 md:py-12 border-t">
                <div className="flex flex-col items-center justify-center text-center gap-6 px-4 md:px-6">
                    <div className="flex flex-col gap-y-4">
                        <h2 className="font-bold tracking-tighter text-[28px] md:text-4xl">
                            Now Hiring
                        </h2>
                        <p className="max-w-[1050px] text-gray-500/70 text-base md:text-xl/relaxed">
                            We are currently seeking <span className="font-bold text-gray-800/70">talented and passionate students (MS/PhD) as well as undergraduate research interns</span>.
                            Please feel free to contact us <span
                            className="font-bold text-gray-800/70">bkoh@konkuk.ac.kr (오병국 교수)</span> if you are
                            interested in our
                            research.
                        </p>
                    </div>
                </div>
            </section>

            <section className="w-full py-6 md:py-12">
            </section>

            {/*  <section className="w-full py-12 md:py-24 lg:py-32 grid gap-4">*/}
            {/*    <div className="mx-auto max-w-6xl grid gap-4 px-4 md:gap-6 md:px-6 lg:grid-cols-[1fr_2fr] lg:gap-12">*/}
            {/*      <div className="flex flex-col gap-2">*/}
            {/*        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">*/}
            {/*          Artificial Intelligence and Machine Learning*/}
            {/*        </h2>*/}
            {/*        <p className="max-w-prose text-gray-500/70 md:text-base/relaxed lg:text-xl/relaxed xl:text-xl/relaxed dark:text-gray-400/70 dark:prose-dark">*/}
            {/*          Our research focuses on developing AI algorithms and applications for various domains, including*/}
            {/*          healthcare, finance, and autonomous systems. We aim to push the boundaries of AI and enable machines to*/}
            {/*          learn, reason, and make decisions in complex environments.*/}
            {/*        </p>*/}
            {/*      </div>*/}
            {/*      <div className="flex items-center justify-center">*/}
            {/*        <img*/}
            {/*          alt="Image"*/}
            {/*          className="aspect-video overflow-hidden rounded-xl object-cover object-center"*/}
            {/*          height="400"*/}
            {/*          src="/placeholder.svg"*/}
            {/*          width="600"*/}
            {/*        />*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </section>*/}
            {/*  <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">*/}
            {/*    <div className="container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10">*/}
            {/*      <div className="space-y-2">*/}
            {/*        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">*/}
            {/*          Explore Our Research Areas*/}
            {/*        </h2>*/}
            {/*        <p className="mx-auto max-w-[700px] text-gray-500/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400/70 dark:prose-dark">*/}
            {/*          Our multidisciplinary approach brings together expertise from various fields to address complex*/}
            {/*          challenges and drive innovation.*/}
            {/*        </p>*/}
            {/*      </div>*/}
            {/*      <div className="grid w-full grid-cols-1 items-stretch justify-center md:grid-cols-3 lg:gap-6 xl:gap-8">*/}
            {/*        <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">*/}
            {/*          <img*/}
            {/*            alt="Image"*/}
            {/*            className="aspect-video overflow-hidden rounded-xl object-cover object-center"*/}
            {/*            height="200"*/}
            {/*            src="/placeholder.svg"*/}
            {/*            width="300"*/}
            {/*          />*/}
            {/*          <h3 className="text-lg font-bold tracking-tighter sm:text-xl md:text-2xl">Healthcare Innovation</h3>*/}
            {/*          <p className="text-sm text-gray-500/70 dark:text-gray-400/70">*/}
            {/*            Transforming patient care through technology*/}
            {/*          </p>*/}
            {/*        </div>*/}
            {/*        <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">*/}
            {/*          <img*/}
            {/*            alt="Image"*/}
            {/*            className="aspect-video overflow-hidden rounded-xl object-cover object-center"*/}
            {/*            height="200"*/}
            {/*            src="/placeholder.svg"*/}
            {/*            width="300"*/}
            {/*          />*/}
            {/*          <h3 className="text-lg font-bold tracking-tighter sm:text-xl md:text-2xl">Sustainable Energy</h3>*/}
            {/*          <p className="text-sm text-gray-500/70 dark:text-gray-400/70">*/}
            {/*            Advancing clean and renewable power solutions*/}
            {/*          </p>*/}
            {/*        </div>*/}
            {/*        <div className="mx-auto flex w-full items-center justify-center p-4 sm:p-8">*/}
            {/*          <img*/}
            {/*            alt="Image"*/}
            {/*            className="aspect-video overflow-hidden rounded-xl object-cover object-center"*/}
            {/*            height="200"*/}
            {/*            src="/placeholder.svg"*/}
            {/*            width="300"*/}
            {/*          />*/}
            {/*          <h3 className="text-lg font-bold tracking-tighter sm:text-xl md:text-2xl">Urban Mobility</h3>*/}
            {/*          <p className="text-sm text-gray-500/70 dark:text-gray-400/70">*/}
            {/*            Innovating transportation for smart cities*/}
            {/*          </p>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </section>*/}
            {/*  <section className="w-full py-12 md:py-24 lg:py-32">*/}
            {/*    <div className="container grid items-center gap-4 px-4 text-center md:px-6">*/}
            {/*      <div className="space-y-2">*/}
            {/*        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">State-of-the-Art Facilities</h2>*/}
            {/*        <p className="mx-auto max-w-[600px] text-gray-500/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400/70 dark:prose-dark">*/}
            {/*          Our laboratory is equipped with the latest tools and technology to support cutting-edge research and*/}
            {/*          experimentation.*/}
            {/*        </p>*/}
            {/*      </div>*/}
            {/*      <div className="mx-auto w-full max-w-[900px] grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-10">*/}
            {/*        <img*/}
            {/*          alt="Image"*/}
            {/*          className="aspect-video rounded-lg overflow-hidden object-cover object-center"*/}
            {/*          height="400"*/}
            {/*          src="/placeholder.svg"*/}
            {/*          width="600"*/}
            {/*        />*/}
            {/*        <img*/}
            {/*          alt="Image"*/}
            {/*          className="aspect-video rounded-lg overflow-hidden object-cover object-center"*/}
            {/*          height="400"*/}
            {/*          src="/placeholder.svg"*/}
            {/*          width="600"*/}
            {/*        />*/}
            {/*        <img*/}
            {/*          alt="Image"*/}
            {/*          className="aspect-video rounded-lg overflow-hidden object-cover object-center"*/}
            {/*          height="400"*/}
            {/*          src="/placeholder.svg"*/}
            {/*          width="600"*/}
            {/*        />*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </section>*/}
        </div>
    )
}