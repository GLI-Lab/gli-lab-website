import {Metadata} from "next";

import {getMetadata} from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import ProfileCardList from "@/components/ProfileCard_v2";


export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: `Members`,
    });
};

export default function Page() {
    return (
        <div className="max-w-screen-2xl mx-auto">
            <SubCover title="Members"/>
            <ProfileCardList/>
        </div>
    );
}
