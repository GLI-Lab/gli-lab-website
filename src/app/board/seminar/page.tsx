import { Metadata } from "next";
import { getMetadata } from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { SeminarList } from "@/components/Seminar";
import { getSeminars } from "@/data/loaders/seminarLoader";
import { getProfiles, getAlumniProfiles } from "@/data/loaders/profileLoader";

const TITLE = "Seminar";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
    description: "Seminars and presentations from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
  });
};

export default async function Page() {
  const [seminars, profiles, alumniProfiles] = await Promise.all([
    getSeminars(),
    getProfiles(),
    getAlumniProfiles().catch(() => []),
  ]);
  const totalSeminars = seminars.length;

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover title={TITLE} showBreadcrumb={false} />
      </div>

      <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
        <div className="mb-4">
          <p className="text-gray-600 text-lg">
            Total <span className="font-semibold text-gray-900">{totalSeminars}</span> seminars
          </p>
        </div>

        <SeminarList seminarItems={seminars} profiles={profiles} alumniProfiles={alumniProfiles} />
      </div>

      <div className="h-40"></div>
    </>
  );
}
