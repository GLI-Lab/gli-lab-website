import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { NewsList } from "@/components/News";
import { getNews } from "@/data/loaders/newsLoader";
import { getMemberIds, getAlumniIds } from "@/data/loaders/profileLoader";

const TITLE = 'News'

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Latest news and updates from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/board/news'
    });
};

export default async function Page() {
    // 뉴스와 프로필 ID 리스트 데이터 로딩
    const newsItems = await getNews();
    const memberIds = await getMemberIds();
    const alumniIds = await getAlumniIds();

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
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
                        memberIds={memberIds}
                        alumniIds={alumniIds}
                    />
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
