import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { NewsList } from "@/components/Board/NewsList";
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
    const newsItems = await getNews();
    const memberIds = await getMemberIds();
    const alumniIds = await getAlumniIds();

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <NewsList 
                    className="w-full text-left"
                    count={100}
                    newsItems={newsItems}
                    memberIds={memberIds}
                    alumniIds={alumniIds}
                    showFilters={true}
                />
            </div>
            <div className="h-40"></div>
        </>
    )
}
