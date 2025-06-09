import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import {StudyList} from "@/components/Study";
import {getStudyItems} from "@/components/Study/studyData";
import {getProfiles} from "@/components/Profile";

const TITLE = `Study`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
    });
};

export default async function Page() {
    const studies = await getStudyItems();
    const profiles = await getProfiles();
    const totalStudies = studies.length;

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE}/>
            </div>

            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                <div className="mb-8">
                    <p className="text-gray-600 text-lg">
                        Total <span className="font-semibold text-gray-900">{totalStudies}</span> studies
                    </p>
                </div>

                <StudyList className="" studyItems={studies} profiles={profiles}/>
            </div>
        </>
    )
}
