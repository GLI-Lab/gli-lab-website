import { SubCover } from '@/components/Covers';
import { GalleryGrid, getGalleryItems } from '@/components/Gallery';
import { ViewCountsProvider } from '@/components/ViewCount';
import { getViewCounts } from '@/lib/viewStore';

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

      {/* 조회수는 기다리지 않고 Promise째로 넘긴다. 앨범 모달이 이 값을 읽어 숫자를 표시한다.
          children(page)도 안에 둔다 — 앨범을 열 때마다 page가 새 조회수를 알려 준다. */}
      <ViewCountsProvider counts={getViewCounts('gallery')}>
        <div className="max-w-screen-xl mx-auto overflow-visible px-4 md:px-6 py-4 md:py-8">
          <GalleryGrid items={galleryItems} />
        </div>

        {children}
      </ViewCountsProvider>

    </>
  );
}
