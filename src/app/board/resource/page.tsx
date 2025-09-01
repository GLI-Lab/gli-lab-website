import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";

const TITLE = 'Resource'

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Useful resources and conference rankings from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/board/resource'
    });
};

export default async function Page() {
    const resources = [
        {
            title: "CORE Conference Rankings ⭐ ",
            description: "Conference ranking system by Computing Research and Education Association of Australasia",
            url: "https://portal.core.edu.au/conf-ranks/?search=&by=all&source=CORE2023&sort=arank&page=1"
        },
        {
            title: "CSConfStats ⭐",
            description: "Conference statistics and rankings for computer science",
            url: "https://csconfstats.xoveexu.com/?conf=CIKM"
        },
        {
            title: "Research.com Conference Rankings",
            description: "Computer Science conference rankings and academic statistics",
            url: "https://research.com/conference-rankings/computer-science"
        },
        {
            title: "CSRankings",
            description: "Computer Science rankings for conferences and institutions",
            url: "https://csrankings.org/#/index?all&kr"
        }
    ];

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>
            
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                {/* 총 리소스 개수 */}
                <div className="mb-4">
                    <p className="text-gray-600 text-lg">
                        Total <span className="font-semibold text-gray-900">{resources.length}</span> resources
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Conference Rankings & Resources
                    </h2>
                    
                    <ul className="space-y-4">
                        {resources.map((resource, index) => (
                            <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                <div className="flex-1">
                                    <a 
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                    >
                                        {resource.title}
                                    </a>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {resource.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="h-40"></div>
        </>
    )
}
