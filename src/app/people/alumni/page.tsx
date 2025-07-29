import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { ProfileCardList } from "@/components/Profile";
import { getPapers } from "@/data/loaders/paperLoader";
import { getAlumniProfiles } from "@/data/loaders/profileLoader";
import { getStudies } from "@/data/loaders/studyLoader";

const PAGE_TITLE = `Alumni`

export async function generateMetadata() {
    return getMetadata({
        title: PAGE_TITLE,
        description: "Explore the alumni of GLI Lab - Graph Learning and Intelligence Laboratory",
        asPath: '/people/alumni'
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
    
    // 프로필 찾기 - URL에 ID가 있을 때만 선택
    let selectedProfile = null;
    if (selectedId) {
        selectedProfile = profiles.find((profile: any) => profile.id === selectedId);
    }
    
    return (
        <div className="max-w-screen-2xl mx-auto">
            <SubCover title={PAGE_TITLE}/>
            <ProfileCardList 
                profiles={profiles} 
                selectedProfile={selectedProfile}
                studies={studies} 
                papers={papers} 
                isAlumniPage={true}
            />
        </div>
    );
} 