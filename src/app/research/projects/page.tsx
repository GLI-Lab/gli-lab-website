import { Metadata } from "next";
import { getMetadata } from "@/lib/GetMetadata";
import { SubCover } from "@/components/Covers";
import { getProjects } from "@/data/loaders/projectLoader";
import ProjectList from "@/components/Research/ProjectList";

const TITLE = "Projects";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
    description:
      "Ongoing and completed projects from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University",
    asPath: "/research/projects",
  });
};

export default async function Page() {
  const projects = await getProjects();

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover title={TITLE} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
      </div>

      <div className="max-w-screen-xl mx-auto px-3 md:px-5 py-8 md:py-12">
        <ProjectList projects={projects} className="w-full" />
      </div>

      <div className="h-40"></div>
    </>
  );
}
