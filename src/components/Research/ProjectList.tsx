"use client";

import React, { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { ProjectData } from "@/data/loaders/types";

function formatDateRange(start: string, end: string): string {
  const s = start?.replace(/-/g, ".") ?? "";
  const e = end?.replace(/-/g, ".") ?? "";
  return s && e ? `${s} ~ ${e}` : s || e;
}

function isOngoing(project: ProjectData): boolean {
  if (!project.end_date) return true;
  const today = new Date();
  const [y, m] = project.end_date.split("-").map(Number);
  const end = new Date(y, (m ?? 1) - 1);
  return end >= today;
}

/** 하위 항목(가지) 표시용 아이콘 */
function SubItemIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 2v6M4 8h5" />
    </svg>
  );
}

/** 최근 6개월 이내 시작한 프로젝트인지 (start_date 기준) */
function isNewProject(project: ProjectData): boolean {
  if (!project.start_date) return false;
  const [y, m] = project.start_date.split("-").map(Number);
  const startDate = new Date(y, (m ?? 1) - 1);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return startDate >= sixMonthsAgo;
}

function ProjectCard({
  project,
  index,
  isOngoing,
}: {
  project: ProjectData;
  index: number;
  isOngoing: boolean;
}) {
  const dateRange = formatDateRange(project.start_date, project.end_date);
  const hasImage = Boolean(project.image?.url?.trim());
  const [imageError, setImageError] = useState(false);
  const showImage = hasImage && !imageError;
  const imageWidth = project.image?.width;

  return (
    <article className="flex flex-col sm:flex-row sm:items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex-1 px-4 py-3 md:px-6 md:py-4 flex flex-col justify-center min-w-0">
        <div className="flex flex-col space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-snug">
                {project.title}
                {isOngoing && isNewProject(project) && (
                  <span className="ml-2 text-xs font-bold text-red-500 inline-flex">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>N</span>
                    <span className="animate-bounce" style={{ animationDelay: "100ms" }}>e</span>
                    <span className="animate-bounce" style={{ animationDelay: "200ms" }}>w</span>
                  </span>
                )}
              </h3>
            </div>
            <div className="space-y-0.5">
              {(project.main.funder || project.main.program) && (
                <p className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug">
                  {[project.main.funder, project.main.program].filter(Boolean).join("\u00A0\u00A0›\u00A0\u00A0")}
                </p>
              )}
              {(project.parent.funder || project.parent.program) && (
                <p className="text-[14px] md:text-[16px] text-gray-600 leading-snug flex items-start gap-1">
                  <SubItemIcon className="text-gray-600 ml-0.5 shrink-0" />
                  <span className="min-w-0">
                    {project.parent.funder}{project.parent.program && `\u00A0\u00A0›\u00A0\u00A0${project.parent.program}`}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] md:text-[16.5px] font-normal text-gray-600 leading-snug">
              {(project.role === "연구책임자" || project.role === "공동연구자" || project.role === "참여연구자") && (
                <>
                  <span
                    className={
                      project.role === "연구책임자"
                        ? "inline-block bg-brand-primary/10 text-brand-primary text-[13.5px] md:text-[15.5px] px-2 py-0.5 md:py-0.25 rounded-md shrink-0"
                        : "inline-block bg-gray-100 text-gray-600 text-[13.5px] md:text-[15.5px] px-2 py-0.5 md:py-0.25 rounded-md shrink-0"
                    }
                  >
                    {project.role}
                  </span>
                  <span className="text-gray-500">·</span>
                </>
              )}
              <span>{project.type}</span>
              <span className="text-gray-500">·</span>
              <span>{dateRange}</span>
            </div>
        </div>
      </div>
      <div className="hidden lg:flex h-[120px] flex-shrink-0 min-w-[300px] bg-white px-4 md:px-6">
        <div className="w-full flex justify-center items-center h-full">
          {showImage ? (
            <img
              src={project.image!.url}
              alt={project.main.funder || project.parent.funder}
              className="h-full w-auto max-w-none object-contain"
              style={imageWidth != null ? { maxWidth: `${imageWidth}px` } : undefined}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-lg"
              aria-hidden
            >
              {(project.main.funder || project.parent.funder).charAt(0)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

interface ProjectListProps {
  projects: ProjectData[];
  className?: string;
}

export default function ProjectList({ projects, className = "" }: ProjectListProps) {
  const ongoingProjects = projects.filter(isOngoing);
  const completedProjects = projects.filter((p) => !isOngoing(p));
  const totalProjects = projects.length;

  return (
    <div className={className}>
      <div className="mb-6">
        <p className="text-gray-600">
          Total{" "}
          <span className="font-semibold text-gray-900">{totalProjects}</span>{" "}
          projects
        </p>
      </div>

      {/* Ongoing Projects */}
      <div className="mb-12">
        <SectionHeader title="Ongoing" className="" underline={true} size="small"></SectionHeader>

        <ul className="space-y-4 md:space-y-5">
          {ongoingProjects.map((project, index) => (
            <li key={index}>
              <ProjectCard project={project} index={index} isOngoing />
            </li>
          ))}
        </ul>
      </div>

      {/* Completed Projects */}
      <div>
        <SectionHeader title="Completed" className="" underline={true} size="small"></SectionHeader>

        {completedProjects.length > 0 ? (
          <ul className="space-y-4 md:space-y-5">
            {completedProjects.map((project, index) => (
              <li key={index}>
                <ProjectCard project={project} index={index} isOngoing={false} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-gray-200 shadow-sm p-8 md:p-12 bg-white">
            <p className="text-gray-500 text-center">
              No completed projects yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
