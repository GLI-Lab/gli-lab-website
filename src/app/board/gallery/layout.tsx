import { SubCover } from '@/components/Covers';
import { GalleryGrid, getGalleryItems } from '@/components/Gallery';

const TITLE = 'Gallery';
const PATHNAME = '/board/gallery';

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const galleryItems = await getGalleryItems();

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover
          title={TITLE}
          pathname={PATHNAME}
          pattern="diagonal-lines"
          colorVariant="sage"
          showBreadcrumb={false}
        />
      </div>

      <div className="max-w-screen-xl mx-auto overflow-visible px-4 md:px-6 py-4 md:py-8">
        <GalleryGrid items={galleryItems} />
      </div>

      {children}

      <div className="h-[10vh]" />
    </>
  );
}
