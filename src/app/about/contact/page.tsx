import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import {FaCheck} from "react-icons/fa";
import KakaoMap from "@/components/KakaoMap";

const TITLE = `Contact`

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
            {/*              Contact            */}
            {/* =============================== */}
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

            <div className="h-40"></div>
        </>
    )
}
