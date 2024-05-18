import {Metadata} from "next";

import {getMetadata} from "@/lib/GetMetadata";
import Subcover from "@/components/Subcover";
import ProfileCard from "@/components/ProfileCard";
import {profiles_faculty, profiles_graduate, profiles_undergraduate} from "./profiles"


export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: `Research Topics`,
    });
};


export default function Page() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <Subcover pos="Members" />

            {/* Profile Contents */}
            <div className="max-w-screen-xl mx-auto px-5 py-10">

                <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">Faculty</h2>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                    {profiles_faculty.map((profile, index) => (
                        <ProfileCard
                            key={index}
                            image={profile.image}
                            name={profile.name}
                            title={profile.title}
                            period={profile.period}
                            interest={profile.interest}
                            email={profile.email}
                            homepage={profile.homepage}
                        />
                    ))}
                </div>

                <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">Graduate Students</h2>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>
                {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">*/}
                {/*    {profiles_graduate.map((profile, index) => (*/}
                {/*        <ProfileCard*/}
                {/*            key={index}*/}
                {/*            image={profile.image}*/}
                {/*            name={profile.name}*/}
                {/*            title={profile.title}*/}
                {/*            period={profile.period}*/}
                {/*            interest={profile.interest}*/}
                {/*            email={profile.email}*/}
                {/*            homepage={profile.homepage}*/}
                {/*        />*/}
                {/*    ))}*/}
                {/*</div>*/}

                <h2 className="font-medium tracking-tighter text-[26px] md:text-[30px]">Interns</h2>
                <div className="w-14 border-b-4 border-green-900 mt-1 mb-8"></div>
                <div className="x grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                    {profiles_undergraduate.map((profile, index) => (
                        <ProfileCard
                            key={index}
                            image={profile.image}
                            name={profile.name}
                            title={profile.title}
                            period={profile.period}
                            interest={profile.interest}
                            email={profile.email}
                            homepage={profile.homepage}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}