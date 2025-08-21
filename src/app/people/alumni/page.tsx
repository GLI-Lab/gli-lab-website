import {getMetadata} from "@/lib/GetMetadata";
import { Metadata } from "next";
import { SubCover } from "@/components/Covers";
import { ProfileCards } from "@/components/Profile";
import { getAlumniProfiles } from "@/data/loaders/profileLoader";
import { getPapers } from "@/data/loaders/paperLoader";
import { getStudies } from "@/data/loaders/studyLoader";

const TITLE = `Alumni`

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const profiles = await getAlumniProfiles();
    const resolved = await searchParams;
    const id = resolved?.id as string | undefined;
    const view = (resolved?.view as string | undefined) ?? 'card';
    const selected = id ? profiles.find((p: any) => p.id === id) : undefined;
    // 정적 OG 이미지 URL 사용 (fallback: 기본 로고)
    const ogImage = selected ? `/images/profiles-og/alumni/${selected.id}.webp` : '/images/logo/GLI_opengraph_2000x1050.jpg';

    const asPath = id ? `/people/alumni?view=${view}&id=${id}` : '/people/alumni';

    return getMetadata({
        title: TITLE,
        description: "Explore the alumni of GLI Lab",
        asPath,
        ogImage,
    });
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
    const profiles = await getAlumniProfiles();
    const studies = await getStudies();
    const papers = await getPapers();
    const resolvedSearchParams = await searchParams;
    const selectedId = resolvedSearchParams.id as string;
    const viewParam = resolvedSearchParams.view as string;
    
    // 프로필 찾기 - URL에 ID가 있을 때만 선택
    let selectedProfile = null;
    if (selectedId) {
        selectedProfile = profiles.find((profile: any) => profile.id === selectedId);
    }
    
    return (
        <div className="max-w-screen-2xl mx-auto">
            <SubCover title={TITLE} showBreadcrumb={false}/>
            {/* <SubCover title={TITLE} pattern="diagonal-lines-sm" colorVariant="neutral" showBreadcrumb={false}/> */}
            <ProfileCards 
                profiles={profiles} 
                selectedProfile={selectedProfile}
                studies={studies} 
                papers={papers} 
                isAlumniPage={true}
                initialIsCardView={viewParam !== 'list'}
            />
        </div>
    );
} 