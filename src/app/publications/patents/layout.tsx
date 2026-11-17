import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import PatentList from "@/components/Publication/PatentList";
import { getPatents, getProfileLinks } from "@/data/loaders";
import { PATENTS_BASE_PATH } from "@/lib/publicationSlug";

const TITLE = `Patents`
const PATHNAME = PATENTS_BASE_PATH

// 목록 주소(/publications/patents/)의 메타데이터.
// 개별 특허 주소(/publications/patents/<slug>/)에서는 [slug]/page.tsx의 메타데이터가 이것을 덮어쓴다.
export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Registered and filed patents from the Graph & Language Intelligence Lab at Konkuk University",
        asPath: PATHNAME
    });
};

// 특허 목록은 layout에 둔다. 목록 주소와 개별 특허 주소가 같은 목록을 쓰고,
// 주소에 slug가 있으면 PatentList가 그 특허로 스크롤·강조한다.
export default async function PatentsLayout({ children }: { children: React.ReactNode }) {
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
            {children}
        </>
    )
}
