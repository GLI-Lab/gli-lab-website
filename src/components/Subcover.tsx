import {Breadcrumb} from "@/components/Breadcrumb";


interface SubcoverProps {
    pos: string;
}

export default function Subcover(props: SubcoverProps) {
    // bg-cover           : 가로세로 비율 유지 + 이미지가 요소를 완전히 덮도록 확장되거나 축소
    // leading-none       : 텍스트 줄간격 줄이기
    // whitespace-nowrap  : 줄바꿈 없애기
    return (
        <div className="bg-subcover bg-cover bg-center items-center justify-center text-center
                        py-14 lg:py-20 xl:py-24">
            <div className="bg-white bg-opacity-60 rounded-md leading-none space-y-0 mx-auto
                            w-[250px] md:w-[300px] lg:w-[400px] py-5">
                <p className="tracking-tighter font-bold
                              pb-[9px] md:pb-[10px] lg:pb-[11px] xl:pb-[12px]
                              text-[30px] md:text-[34px] lg:text-[38px] xl:text-[40px]">
                    {props.pos}
                </p>
                <div className="text-[#555] text-[14px] md:text-[15px] lg:text-[16px]">
                    <Breadcrumb/>
                </div>
            </div>
        </div>
    )
}