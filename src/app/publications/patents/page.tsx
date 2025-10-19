import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";

const TITLE = `Patents`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Patents from GLI Lab",
        asPath: '/publications/patents'
    });
};

export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>

            <div className="h-40"></div>
        </>
    )
}