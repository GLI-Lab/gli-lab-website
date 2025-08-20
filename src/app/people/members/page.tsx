import {getMetadata} from "@/lib/GetMetadata";
import { Metadata } from "next";
import { SubCover } from "@/components/Covers";
import { ProfileCards } from "@/components/Profile";
import { getProfiles } from "@/data/loaders/profileLoader";
import { getPapers } from "@/data/loaders/paperLoader";
import { getStudies } from "@/data/loaders/studyLoader";

const TITLE = `Members`

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const profiles = await getProfiles();
    const resolved = await searchParams;
    const id = resolved?.id as string | undefined;
    const view = (resolved?.view as string | undefined) ?? 'card';
    const selected = id ? profiles.find((p: any) => p.id === id) : undefined;
    // 동적 세그먼트 OG 이미지 URL 사용
    // const ogImage = selected?.photo?.[0];
    const ogImage = selected ? `/people/members/opengraph-image/${encodeURIComponent(selected.id)}` : undefined;

    const asPath = id ? `/people/members?view=${view}&id=${id}` : '/people/members';

    return getMetadata({
        title: TITLE,
        description: "Explore the members of GLI Lab",
        asPath,
        ogImage,
    });
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
    const profiles = await getProfiles();
    const studies = await getStudies();
    const papers = await getPapers();
    const resolvedSearchParams = await searchParams;
    const selectedId = resolvedSearchParams.id as string;
    const viewParam = resolvedSearchParams.view as string;
    
    // 프로필 찾기
    let selectedProfile;
    if (selectedId) {
        selectedProfile = profiles.find(profile => profile.id === selectedId);
    }
    
    // 기본 프로필 설정 (selectedId가 없거나 프로필을 찾지 못한 경우)
    if (!selectedProfile) {
        console.log('selectedProfile not found', selectedId);
        selectedProfile = profiles.find(profile => profile.id === "[2024.03] 오병국") || profiles[0];
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
                isAlumniPage={false}
                initialIsCardView={viewParam !== 'list'}
            />
        </div>
    );
}
