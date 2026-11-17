import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import PatentList from "@/components/Publication/PatentList";
import { getPatents, getProfileLinks } from "@/data/loaders";

const TITLE = `Patents`
const PATHNAME = '/publications/patents'

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Registered and filed patents from the Graph & Language Intelligence Lab at Konkuk University",
        asPath: '/publications/patents'
    });
};

export default async function Page() {
    const [patents, profileLinks] = await Promise.all([getPatents(), getProfileLinks()]);
    
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
            <SubCover title={TITLE} pathname={PATHNAME} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
            </div>
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <PatentList 
                    className="w-full text-left"
                    patents={patents} 
                    profileLinks={profileLinks}
                />
            </div>
        </>
    )
}