import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import PatentList from "@/components/Publication/PatentList";
import { getPatents } from "@/data/loaders/patentLoader";
import { getMemberIds, getAlumniIds } from "@/data/loaders/profileLoader";

const TITLE = `Patents`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Patents from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/publications/patents'
    });
};

export default async function Page() {
    const patents = await getPatents();
    const memberIds = await getMemberIds();
    const alumniIds = await getAlumniIds();
    
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <PatentList 
                    className="w-full text-left"
                    patents={patents} 
                    memberIds={memberIds}
                    alumniIds={alumniIds}
                />
            </div>
            <div className="h-40"></div>
        </>
    )
}