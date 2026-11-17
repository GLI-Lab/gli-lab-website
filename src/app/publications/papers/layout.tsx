import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import PaperList from "@/components/Publication/PaperList";
import { getPapers, getProfileLinks } from "@/data/loaders";
import { PAPERS_BASE_PATH } from "@/lib/publicationSlug";

const TITLE = `Papers`
const PATHNAME = PAPERS_BASE_PATH

// 목록 주소(/publications/papers/)의 메타데이터.
// 개별 논문 주소(/publications/papers/<slug>/)에서는 [slug]/page.tsx의 메타데이터가 이것을 덮어쓴다.
export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Conference and journal papers from the Graph & Language Intelligence Lab at Konkuk University",
        asPath: PATHNAME
    });
};

// 논문 목록은 layout에 둔다. 목록 주소와 개별 논문 주소가 같은 목록을 쓰고,
// 주소에 slug가 있으면 PaperList가 그 논문으로 스크롤·강조한다.
export default async function PapersLayout({ children }: { children: React.ReactNode }) {
    const [papers, profileLinks] = await Promise.all([getPapers(), getProfileLinks()]);

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} pathname={PATHNAME} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false}/>
            </div>
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <PaperList
                    className="w-full text-left"
                    papers={papers}
                    profileLinks={profileLinks}
                />
            </div>
            {children}
        </>
    )
}
