import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { NewsList } from "@/components/News";

const TITLE = `News`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Latest news and updates from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
    });
};

export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE}/>
            </div>
            
            <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <div className="rounded-lg border border-gray-200 shadow-sm p-4 md:p-8">
                    <NewsList 
                        className="w-full text-left"
                        count={50}
                    />
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
