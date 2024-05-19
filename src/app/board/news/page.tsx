import {Metadata} from "next";
import NotFound from "@/app/not-found";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";

const TITLE = `News`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
    });
};

export default function Page() {
    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE}/>
            </div>
            <div className="max-w-screen-xl mx-auto">
                <NotFound/>
            </div>
        </>
    )
}
