import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import {NewsList} from "@/components/News";

const TITLE = `News`

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

            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center space-y-8
                                py-8 md:py-16 px-4 md:px-6">
                    <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
                        Latest News
                    </p>
                    <NewsList 
                        className="w-full text-home text-left"
                        count={30}
                    />
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
