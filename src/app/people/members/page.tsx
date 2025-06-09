import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { ProfileCardList, getProfiles, getPapers } from "@/components/Profile";
import { getStudyItems } from "@/components/Study/studyData";

const PAGE_TITLE = `Members`

export async function generateMetadata() {
    return getMetadata({
        title: PAGE_TITLE,
        description: "Explore the members of GLI Lab - Graph Learning and Intelligence Laboratory",
        asPath: '/people/members'
    });
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
    const profiles = await getProfiles();
    const studies = await getStudyItems();
    const papers = await getPapers();
    const resolvedSearchParams = await searchParams;
    const selectedId = resolvedSearchParams.id as string;
    
    // 프로필 찾기
    let selectedProfile;
    if (selectedId) {
        selectedProfile = profiles.find(profile => profile.id === selectedId);
    }
    
    // 기본 프로필 설정 (selectedId가 없거나 프로필을 찾지 못한 경우)
    if (!selectedProfile) {
        selectedProfile = profiles.find(profile => profile.id === "[2024.03] 오병국") || profiles[0];
    }
    
    return (
        <div className="max-w-screen-2xl mx-auto">
            <SubCover title={PAGE_TITLE}/>
            <ProfileCardList 
                profiles={profiles} 
                selectedProfile={selectedProfile}
                studies={studies} 
                papers={papers} 
            />
        </div>
    );
}
