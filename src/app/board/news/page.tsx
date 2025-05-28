import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { NewsList, getNewsItems } from "@/components/News";

const PAGE_TITLE = 'News' as const;

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: PAGE_TITLE,
        description: "Latest news and updates from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/board/news'
    });
};

export default async function Page() {
    const newsItems = await getNewsItems();

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={PAGE_TITLE}/>
            </div>
            
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                {/* 총 뉴스 개수 */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        Total <span className="font-semibold text-gray-900">{newsItems.length}</span> news
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 shadow-sm p-2 md:p-4 py-3 md:py-5">
                    <NewsList 
                        className="w-full text-left"
                        count={50}
                        newsItems={newsItems}
                    />
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
