import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { LectureList, getLectureItems } from "@/components/Lecture";

const PAGE_TITLE = 'Lecture'

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: PAGE_TITLE,
        description: "Lectures and courses from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/board/lecture'
    });
};

export default async function Page() {
    const lectureItems = await getLectureItems();
    const totalCourses = lectureItems.reduce((total, semester) => total + semester.courses.length, 0);

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={PAGE_TITLE}/>
            </div>
            
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                {/* 총 강의 개수 */}
                <div className="mb-4">
                    <p className="text-gray-600 text-lg">
                        Total <span className="font-semibold text-gray-900">{totalCourses}</span> lectures
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 shadow-sm p-2 md:p-4 py-3 md:py-5">
                    <LectureList 
                        className="w-full text-left"
                        count={50}
                        lectureItems={lectureItems}
                    />
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
} 