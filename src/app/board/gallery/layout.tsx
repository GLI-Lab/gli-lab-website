import { SubCover } from '@/components/Covers';
import { GalleryGrid, getGalleryItems } from '@/components/Gallery';

const TITLE = 'Gallery';

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
          pattern="diagonal-lines"
          colorVariant="sage"
          showBreadcrumb={false}
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="mb-4">
          <p className="text-gray-600 text-base md:text-lg">
            Total{' '}
            <span className="font-semibold text-gray-900">{galleryItems.length}</span> items
          </p>
        </div>

        <GalleryGrid items={galleryItems} />
      </div>

      {children}

      <div className="h-[10vh]" />
    </>
  );
}
