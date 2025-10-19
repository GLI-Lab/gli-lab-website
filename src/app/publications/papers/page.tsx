import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import PublicationList from "@/components/Publication/PublicationList";
import { getPapers } from "@/data/loaders/paperLoader";
import { getMemberIds, getAlumniIds } from "@/data/loaders/profileLoader";

const TITLE = `Papers`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Papers from GLI Lab",
        asPath: '/publications/papers'
    });
};

export default async function Page() {
    const papers = await getPapers();
    const memberIds = await getMemberIds();
    const alumniIds = await getAlumniIds();
    
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>

            <PublicationList 
                papers={papers} 
                memberIds={memberIds}
                alumniIds={alumniIds}
            />

            <div className="h-40"></div>
        </>
    )
}