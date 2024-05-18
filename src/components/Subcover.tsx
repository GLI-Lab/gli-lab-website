import {Breadcrumb} from "@/components/Breadcrumb";


interface SubcoverProps {
    pos: string;
}

export default function Subcover(props: SubcoverProps) {
    // bg-cover             : 가로세로 비율 유지 + 이미지가 요소를 완전히 덮도록 확장되거나 축소
    // leading-none         : 텍스트 줄간격 줄이기
    // md:whitespace-nowrap : 줄바꿈 없애기
    return (
        <div className="bg-subcover bg-cover bg-center items-center justify-center text-center
                        py-14 lg:py-20 xl:py-24">
            <div className="bg-white bg-opacity-60 rounded-md leading-none md:whitespace-nowrap
                            w-[250px] md:w-[300px] lg:w-[400px] mx-auto
                            py-4 md:py-5 lg:py-6 space-y-0">
                <p className="tracking-tighter font-semibold pb-[6px] md:[8px] lg:pb-[10px] text-[28px] md:text-[32px] lg:text-[36px]">{props.pos}</p>
                <div className="mt-6 md:mt-10 text-[#555] text-[13px] md:text-[14px] lg:text-[15px]">
                    <Breadcrumb/>
                </div>
            </div>
        </div>
    )
}