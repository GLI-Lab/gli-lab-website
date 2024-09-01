import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import React from "react";
import {FaCheck} from "react-icons/fa";

const TITLE = `Project`

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


            <div className="max-w-screen-xl mx-auto px-5 py-10">
                <p className="text-header">Ongoing</p>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>

                <div className="flex flex-col items-center text-left mb-6">
                    <ul className="space-y-6">
                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <div className="flex flex-col space-y-2">
                                <span className="text-accent">
                                    멀티모달 생성모델의 신뢰성 및 제어가능성 향상을 위한 그래프 구조 기반의 상호작용 (2024-09-01 ~ 2028-08-31)
                                </span>
                                <span className="pr-2">한국연구재단 중견연구(유형1)</span>
                                <div className="break-all">
                                    <span className="text-KU-dark_green font-semibold pr-0.5">#</span>
                                    <span className="text-KU-dark_gray pr-2">Multi-Modal LLMs</span>
                                    <span className="text-KU-dark_green font-semibold pr-0.5">#</span>
                                    <span className="text-KU-dark_gray pr-2">Graph ML/DL</span>
                                    <span className="text-KU-dark_green font-semibold pr-0.5">#</span>
                                    <span className="text-KU-dark_gray pr-2">Explainablilty</span>
                                </div>
                            </div>
                        </li>

                        <li className="flex space-x-2">
                            <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0"/>
                            <div className="flex flex-col space-y-2">
                                <span className="text-accent">
                                    논리적 패턴을 반영할 수 있는 지식그래프 표현학습 (2024-04-01 ~ 2025-03-31)
                                </span>
                                <span className="pr-2">KU학술연구비</span>
                                <div className="break-all">
                                    <span className="text-KU-dark_green font-semibold pr-0.5">#</span>
                                    <span className="text-KU-dark_gray pr-2">Knowledge Representation</span>
                                    <span className="text-KU-dark_green font-semibold pr-0.5">#</span>
                                    <span className="text-KU-dark_gray pr-2">Graph ML/DL</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>

                <p className="text-header">Completed</p>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>
            </div>
            <div className="h-40"></div>
        </>
    )
}
