import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { ProfileCardList, getProfiles } from "@/components/Profile";

const PAGE_TITLE = `Members`

export async function generateMetadata() {
    return getMetadata({
        title: PAGE_TITLE,
        description: "Explore the members of GLI Lab - Graph Learning and Intelligence Laboratory",
        asPath: '/people/members'
    });
};

export default async function Page() {
    const profiles = await getProfiles();
    const defaultSelected = profiles.find(profile => profile.name_en === "Byungkook Oh") || profiles[0];
    
    return (
        <div className="max-w-screen-2xl mx-auto">
            <SubCover title={PAGE_TITLE}/>
            <ProfileCardList profiles={profiles} defaultSelected={defaultSelected} />
        </div>
    );
}
