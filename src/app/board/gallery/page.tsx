import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";
import {SubCover} from "@/components/Covers";
import { getGalleryItems, GalleryGrid } from "@/components/Gallery";

const TITLE = 'Gallery'

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: TITLE,
        description: "Photo gallery and visual content from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
        asPath: '/board/gallery'
    });
};

export default async function Page() {
    const galleryItems = await getGalleryItems();

    return (
        <>
            <div className="max-w-screen-2xl mx-auto">
                <SubCover title={TITLE} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
            </div>
            
            <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <div className="mb-4">
                    <p className="text-gray-600 text-base md:text-lg">
                        Total <span className="font-semibold text-gray-900">{galleryItems.length}</span> items
                    </p>
                </div>
                
                <GalleryGrid items={galleryItems} />
            </div>

            <div className="h-[10vh]"></div>
        </>
    )
}
