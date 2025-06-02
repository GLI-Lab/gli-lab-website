import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { ProfileCardList, getProfiles } from "@/components/Profile";
import { getStudyItems } from "@/components/Study";

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
    const resolvedSearchParams = await searchParams;
    const selectedId = resolvedSearchParams.id as string;
    
    let defaultSelected = profiles.find(profile => profile.name_en === "Byungkook Oh") || profiles[0];
    
    // URL 파라미터에서 ID가 전달된 경우
    if (selectedId) {
        const foundProfile = profiles.find(profile => profile.id === selectedId);
        if (foundProfile) {
            defaultSelected = foundProfile;
        }
    }
    
    return (
        <div className="max-w-screen-2xl mx-auto">
            <SubCover title={PAGE_TITLE}/>
            <ProfileCardList profiles={profiles} defaultSelected={defaultSelected} studies={studies} />
        </div>
    );
}
