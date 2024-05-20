import {Metadata} from "next";
import NotFound from "@/app/not-found";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";

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

                    <p className="text-home">We are currently seeking <span className="highlight">talented and passionate students (MS/PhD) as well as undergraduate research interns</span>.
                        Please feel free to contact us <span
                            className="font-semibold">bkoh@konkuk.ac.kr (오병국 교수)</span> if you are interested in our
                        research.</p>

                    <p className="text-home">그래프 머신러닝과 지식 기반의 지능형 시스템에 관심이 있는 대학원 지망생과 학부연구생은 언제든지 연락 주시기 바랍니다.</p>
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
