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
    const excellentConferences = [
        {
            title: "CS 분야 우수 학술대회 목록 ⭐",
            description: "Comprehensive list of excellent computer science conferences",
            url: "https://gist.github.com/Pusnow/6eb933355b5cb8d31ef1abcb3c3e1206"
        },
        {
            title: "CORE Conference Rankings ⭐",
            description: "Conference ranking system by Computing Research and Education Association of Australasia",
            url: "https://portal.core.edu.au/conf-ranks/?search=&by=all&source=CORE2023&sort=arank&page=1"
        },
        {
            title: "CSConfStats ⭐",
            description: "Conference statistics and rankings for computer science",
            url: "https://csconfstats.xoveexu.com/?conf=CIKM"
        },
        {
            title: "Best CS Conferences (Impact Score)",
            description: "Computer Science conference rankings and academic statistics",
            url: "https://research.com/conference-rankings/computer-science"
        },
        {
            title: "CSRankings",
            description: "A metrics-based ranking of top computer science institutions around the world",
            url: "https://csrankings.org/#/index?all&kr"
        }
    ];

    const deadlineResources = [
        {
            title: "CS Deadlines ⭐",
            description: "Comprehensive database of computer science conference deadlines",
            url: "https://cs-deadlines.cin.ufpe.br/"
        },
        {
            title: "Conference List",
            description: "Upcoming conference information and deadlines",
            url: "https://conferencelist.info/upcoming/"
        },
        {
            title: "VDeadline",
            description: "Conference deadline tracking and management",
            url: "https://vdeadline.org/"
        },
        {
            title: "Roars CS Conferences",
            description: "CS conference tracking with CSRankings and CORE integration",
            url: "https://roars.dev/csconfs/?csrankings=AAAI,IJCAI,CVPR,ECCV,ICCV,ICLR,ICML,KDD,NeurIPS,ACL,EMNLP,NAACL,SIGIR,WWW&core=NeurIPS,SENSYS,KDD,MOBICOM,SIGIR,ACMMM,PODC,ACL,COLT,EMNLP,ECCV,CVPR,INFOCOM,ICCV,ICDM,PERCOM,SP,ISMAR,IPSN,ICAPS,ICLR,ICML,KR,EuroCrypt,IJCAI,AAMAS,WWW,AAAI,USENIX-Security"
        },
        {
            title: "AI Deadlines",
            description: "AI conference deadlines for ML, NLP, DM, KR, IRSM, and more",
            url: "http://aideadlines.org/?sub=ML,NLP,DM,KR,IRSM,MISC"
        }
    ];

    const totalResources = excellentConferences.length + deadlineResources.length;

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} showBreadcrumb={false}/>
            </div>
            
            <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
                {/* 총 리소스 개수 */}
                <div className="mb-6">
                    <p className="text-gray-600 text-lg">
                        Total <span className="font-semibold text-gray-900">{totalResources}</span> resources
                    </p>
                </div>

                {/* 우수 학술대회 목록 */}
                <div className="rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        우수 학술대회 목록
                    </h2>
                    
                    <ul className="space-y-4">
                        {excellentConferences.map((resource, index) => (
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

                {/* 학술대회 데드라인 */}
                <div className="rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        학술대회 데드라인
                    </h2>
                    
                    <ul className="space-y-4">
                        {deadlineResources.map((resource, index) => (
                            <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
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
