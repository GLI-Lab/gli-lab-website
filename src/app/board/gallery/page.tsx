import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { getGalleryItems, GalleryGrid } from "@/components/Gallery";

const TITLE = `Gallery`

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
    });
};

export default async function Page() {
    const galleryItems = await getGalleryItems();

    // // 년도별로 그룹화
    // const groupItemsByYear = (items: typeof galleryItems) => {
    //     const grouped: { [year: string]: typeof galleryItems } = {};
        
    //     items.forEach(item => {
    //         const year = item.date ? new Date(item.date).getFullYear().toString() : 'Unknown';
    //         if (!grouped[year]) {
    //             grouped[year] = [];
    //         }
    //         grouped[year].push(item);
    //     });

    //     // 년도순으로 정렬 (최신년도 먼저)
    //     const sortedYears = Object.keys(grouped).sort((a, b) => {
    //         if (a === 'Unknown') return 1;
    //         if (b === 'Unknown') return -1;
    //         return parseInt(b) - parseInt(a);
    //     });

    //     return sortedYears.map(year => ({
    //         year,
    //         items: grouped[year]
    //     }));
    // };

    // const groupedItems = groupItemsByYear(galleryItems);

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE}/>
            </div>
            
            <div className="max-w-screen-2xl mx-auto bg-white">
                <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-16">
                    {/* 총 게시글 개수 */}
                    <div className="mb-8">
                        <p className="text-gray-600 text-lg">
                            Total <span className="font-semibold text-gray-900">{galleryItems.length}</span> items
                        </p>
                    </div>

                    {/* 전체 갤러리 아이템들 */}
                    <GalleryGrid items={galleryItems} />

                    {/* 년도별 그룹화 출력 (주석처리) */}
                    {/* {groupedItems.map((yearGroup) => (
                        <div key={yearGroup.year} className="mb-12">
                            <div className="mb-8">
                                <h2 className="font-medium tracking-tight text-[26px] md:text-[30px]">{yearGroup.year}</h2>
                                <div className="w-14 border-b-4 border-border-accent mt-1"></div>
                            </div>
                            
                            <GalleryGrid items={yearGroup.items} />
                        </div>
                    ))} */}
                </div>
            </div> 

            <div className="h-40"></div>
        </>
    )
}
