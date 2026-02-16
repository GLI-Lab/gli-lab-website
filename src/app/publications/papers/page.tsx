import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import PaperList from "@/components/Publication/PaperList";
import { getPapers } from "@/data/loaders/paperLoader";
import { getMemberIds, getAlumniIds } from "@/data/loaders/profileLoader";

const TITLE = `Papers`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Papers from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/publications/papers'
    });
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
    const papers = await getPapers();
    const memberIds = await getMemberIds();
    const alumniIds = await getAlumniIds();
    const resolvedSearchParams = await searchParams;
    const showInProgress = resolvedSearchParams?.showInProgress === 'true';
    
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
            <SubCover title={TITLE} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
            </div>
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <PaperList 
                    className="w-full text-left"
                    papers={papers} 
                    memberIds={memberIds}
                    alumniIds={alumniIds}
                    initialShowInProgress={showInProgress}
                />
            </div>
            <div className="h-40"></div>
        </>
    )
}