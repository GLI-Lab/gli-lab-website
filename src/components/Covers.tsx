import {Breadcrumb} from "@/components/Breadcrumb";

// bg-cover           : 가로세로 비율 유지 + 이미지가 요소를 완전히 덮도록 확장되거나 축소
// leading-none       : 텍스트 줄간격 줄이기
// whitespace-nowrap  : 줄바꿈 없애기

interface CoverProps {
    title: string;
}

export function SubCover(props: CoverProps) {
    return (
        <div className="bg-subcover bg-cover bg-center items-center justify-center text-center
                        py-14 lg:py-20 xl:py-24">
            <div className="bg-white bg-opacity-60 rounded-md leading-none space-y-0 mx-auto
                            w-[250px] md:w-[300px] lg:w-[400px] py-5">
                <p className="tracking-tighter font-bold
                              pb-[9px] md:pb-[10px] lg:pb-[11px] xl:pb-[12px]
                              text-[30px] md:text-[34px] lg:text-[38px] xl:text-[40px]">
                    {props.title}
                </p>
                <div className="text-[#555] text-[14px] md:text-[15px] lg:text-[16px]">
                    <Breadcrumb/>
                </div>
            </div>
        </div>
    )
}

export function MainCover() {
    return (
        <div className="animate-slider bg-cover bg-center items-center justify-center text-center
                        py-24 md:py-36 lg:py-48 xl:py-56">
            <div className="bg-white bg-opacity-55 font-bold leading-none md:whitespace-nowrap
                            space-y-1 lg:space-y-2
                            p-2 md:p-3 lg:p-4">
                <p className="tracking-tighter text-[36px] md:text-[44px] lg:text-[54px] xl:text-[60px]">Graph &
                    Language Intelligence Lab.</p>
                <p className="tracking-tighter text-[#888] text-[30px] md:text-[36px] lg:text-[42px] xl:text-[48px]">@
                    Konkuk Univ.</p>
            </div>
        </div>
    )
}