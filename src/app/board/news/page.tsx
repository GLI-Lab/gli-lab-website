import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { NewsList } from "@/components/Board/NewsList";
import { getNews, getPapers, getPatents, getProfileLinks, getProjects } from "@/data/loaders";
import { buildPublicationPreviews } from "@/components/Publication/publicationPreview";
import { buildProjectPreviews } from "@/components/Research/projectPreview";

const TITLE = 'News'
const PATHNAME = '/board/news'

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Latest news and updates from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/board/news'
    });
};

export default async function Page() {
    const [newsItems, profileLinks, papers, patents, projects] = await Promise.all([
        getNews(),
        getProfileLinks(),
        getPapers(),
        getPatents(),
        getProjects(),
    ]);
    const publicationPreviews = buildPublicationPreviews(papers, patents);
    const projectPreviews = buildProjectPreviews(projects);

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
            <SubCover title={TITLE} pathname={PATHNAME} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
            </div>
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <NewsList 
                    className="w-full text-left"
                    count={100}
                    newsItems={newsItems}
                    profileLinks={profileLinks}
                    publicationPreviews={publicationPreviews}
                    projectPreviews={projectPreviews}
                    showFilters={true}
                />
            </div>
        </>
    )
}
