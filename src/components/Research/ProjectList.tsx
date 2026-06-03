"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { ProjectData, ProjectMember } from "@/data/loaders/types";
import { getProfileBasePath, titleToId } from "@/lib/utils";

/** 참여 인원을 프로필 링크와 함께 렌더링 (board/study 페이지의 사람 이름 스타일 참고)
 *  - 현재 멤버(/people/members)와 과거 멤버(alumni, /people/alumni) 모두 링크 가능 */
function renderMember(
  member: ProjectMember,
  memberIds: string[],
  alumniIds: string[],
  key: React.Key
) {
  const basePath = member.ID ? getProfileBasePath(member.ID, memberIds, alumniIds) : null;
  const hasValidId = !!basePath;
  const hasId = !!member.ID;

  if (hasValidId) {
    return (
      <Link
        key={key}
        href={`${basePath}?id=${member.ID!.replace(/\s/g, "%20")}`}
        className="underline-offset-4 hover:underline hover:decoration-1.5 hover:text-brand-primary hover:decoration-brand-primary hover:font-medium transition-all duration-200"
        title={`View ${member.name}`}
      >
        <span className="transition-colors [&:hover>svg]:text-brand-primary">
          {member.name}
          <svg
            className="w-3.5 h-3.5 ml-0.5 inline text-gray-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      </Link>
    );
  }

  if (hasId) {
    return (
      <span key={key} className="text-red-500" title={`Profile not found: ${member.ID}`}>
        {member.name}
      </span>
    );
  }

  return <span key={key}>{member.name}</span>;
}

function renderMemberList(
  members: ProjectMember[],
  memberIds: string[],
  alumniIds: string[],
  keyPrefix: string | number = ""
) {
  return members.map((member, i) => (
    <React.Fragment key={`${keyPrefix}-${i}`}>
      {renderMember(member, memberIds, alumniIds, `${keyPrefix}-${i}`)}
      {i < members.length - 1 && ", "}
    </React.Fragment>
  ));
}

const PARTICIPANTS_PER_ROW = 4;

/** 참여자 명단: 한 줄에 최대 4명, 초과 시 다음 줄 */
function renderParticipantList(
  members: ProjectMember[],
  memberIds: string[],
  alumniIds: string[]
) {
  const rows: ProjectMember[][] = [];
  for (let i = 0; i < members.length; i += PARTICIPANTS_PER_ROW) {
    rows.push(members.slice(i, i + PARTICIPANTS_PER_ROW));
  }
  return (
    <span className="flex flex-col gap-0.5">
      {rows.map((row, rowIndex) => (
        <span key={rowIndex}>
          {renderMemberList(row, memberIds, alumniIds, `participant-${rowIndex}`)}
        </span>
      ))}
    </span>
  );
}

/** 참여자 전체 누적 명단 = participants + managers (ID, 없으면 이름 기준 중복 제거) */
function mergeParticipants(
  managers: ProjectMember[],
  participants: ProjectMember[]
): ProjectMember[] {
  const seen = new Set<string>();
  const result: ProjectMember[] = [];
  for (const m of [...participants, ...managers]) {
    const key = m.ID ? `id:${m.ID}` : `name:${m.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ ID: m.ID, name: m.name });
  }
  return result;
}


function formatDateRange(start: string, end: string): string {
  const s = start?.replace(/-/g, ".") ?? "";
  const e = end?.replace(/-/g, ".") ?? "";
  return s && e ? `${s} ~ ${e}` : s || e;
}

/** YYYY-MM -> YYYY.MM */
function formatMonth(d?: string | null): string {
  if (!d) return "";
  return d.replace(/-/g, ".");
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
  isHighlighted = false,
  memberIds = [],
  alumniIds = [],
}: {
  project: ProjectData;
  index: number;
  isOngoing: boolean;
  isHighlighted?: boolean;
  memberIds?: string[];
  alumniIds?: string[];
}) {
  const dateRange = formatDateRange(project.start_date, project.end_date);
  const hasImage = Boolean(project.image?.url?.trim());
  const [imageError, setImageError] = useState(false);
  const showImage = hasImage && !imageError;
  const imageWidth = project.image?.width;

  const currentManagers = project.managers.filter((m) => !m.until);
  const pastManagers = project.managers.filter((m) => m.until);
  const participantRoster = mergeParticipants(project.managers, project.participants);
  const hasParticipants = participantRoster.length > 0;
  const hasPeople = project.managers.length > 0 || hasParticipants;
  const hasRole =
    project.role === "연구책임자" || project.role === "공동연구자" || project.role === "참여연구자";
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <article
      className={`relative flex flex-col rounded-xl border bg-white transition-all duration-300 overflow-hidden ${
        isHighlighted
          ? "border-brand-primary shadow-lg animate-pulse"
          : "border-gray-200 shadow-sm hover:border-interactive-primary hover:shadow-md"
      }`}
    >
      {isHighlighted && (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-brand-primary/10" />
      )}
      <div
        className={`flex flex-col sm:flex-row sm:items-stretch ${hasPeople ? "cursor-pointer group" : ""}`}
        onClick={hasPeople ? toggleExpanded : undefined}
        role={hasPeople ? "button" : undefined}
        tabIndex={hasPeople ? 0 : undefined}
        aria-expanded={hasPeople ? isExpanded : undefined}
        onKeyDown={
          hasPeople
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpanded();
                }
              }
            : undefined
        }
      >
      <div className="hidden lg:flex min-h-[120px] flex-shrink-0 min-w-[300px] bg-white px-4 md:px-6 rounded-l-xl">
        <div className="w-full flex justify-center items-center h-full">
          {showImage ? (
            <img
              src={project.image!.url}
              alt={project.main.funder || project.parent.funder}
              className="max-h-[120px] w-auto max-w-none object-contain"
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
      <div className="hidden lg:block border-l border-gray-200 my-3 md:my-4" aria-hidden />
      <div className="flex-1 px-4 py-3 md:px-6 md:py-4 flex flex-col justify-center min-w-0">
        <div className="flex flex-col space-y-2 min-w-0">
            {hasRole && (
              <div className="flex">
                <span
                  className={
                    project.role === "연구책임자"
                      ? "inline-block bg-brand-primary/10 text-brand-primary text-[13.5px] md:text-[15.5px] px-2 py-0.5 md:py-0.25 rounded-md shrink-0"
                      : "inline-block bg-gray-100 text-gray-600 text-[13.5px] md:text-[15.5px] px-2 py-0.5 md:py-0.25 rounded-md shrink-0"
                  }
                >
                  {project.role}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-800 leading-snug">
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
              <span>{project.type}</span>
              <span className="text-gray-500">·</span>
              <span>{dateRange}</span>
              {hasPeople && (
                <span className="ml-auto pl-2 flex items-center gap-1 text-xs sm:text-sm text-gray-500 group-hover:underline group-hover:text-interactive-primary whitespace-nowrap">
                  {isExpanded ? "Hide" : "See more"}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              )}
            </div>
        </div>
      </div>
      </div>

      {hasPeople && (
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 px-4 py-3 md:px-6 md:py-4 space-y-2 text-[13.5px] md:text-[15.5px] leading-snug">
            {currentManagers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-2">
                <span className="font-semibold text-gray-700 shrink-0 min-w-[120px]">실무책임자</span>
                <span className="flex flex-col gap-0.5 text-gray-600">
                  {currentManagers.map((manager, i) => (
                    <span key={i}>
                      {renderMember(manager, memberIds, alumniIds, `current-${i}`)}
                      {manager.since && (
                        <span className="ml-1.5 text-gray-400 text-[0.9em]">
                          · {formatMonth(manager.since)} ~ {isOngoing ? "Current" : formatMonth(project.end_date)}
                        </span>
                      )}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {pastManagers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-2">
                <span className="font-semibold text-gray-500 shrink-0 min-w-[120px]">실무책임자 (이전)</span>
                <span className="flex flex-col gap-0.5 text-gray-500">
                  {pastManagers.map((manager, i) => (
                    <span key={i}>
                      {renderMember(manager, memberIds, alumniIds, `past-${i}`)}
                      <span className="ml-1.5 text-gray-400 text-[0.9em]">
                        · {manager.since ? `${formatMonth(manager.since)} ~ ` : "~ "}{formatMonth(manager.until)}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            )}
            {hasParticipants && (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                <span className="font-semibold text-gray-700 shrink-0 min-w-[120px]">참여자</span>
                <span className="text-gray-600">
                  {renderParticipantList(participantRoster, memberIds, alumniIds)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

interface ProjectListProps {
  projects: ProjectData[];
  memberIds?: string[];
  alumniIds?: string[];
  className?: string;
}

export default function ProjectList({ projects, memberIds = [], alumniIds = [], className = "" }: ProjectListProps) {
  const [showTalentDevelopment, setShowTalentDevelopment] = useState(true);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);

  const filteredProjects = useMemo(
    () =>
      showTalentDevelopment
        ? projects
        : projects.filter((p) => p.type !== "인력양성"),
    [projects, showTalentDevelopment]
  );

  const ongoingProjects = filteredProjects.filter(isOngoing);
  const completedProjects = filteredProjects.filter((p) => !isOngoing(p));
  const visibleCount = filteredProjects.length;
  const allCount = projects.length;

  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;

    const checkHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const targetId = titleToId(decodeURIComponent(hash.substring(1)));
      const targetProject = projects.find((project) => titleToId(project.title) === targetId);
      if (!targetProject) return;

      if (targetProject.type === "인력양성") {
        setShowTalentDevelopment(true);
      }

      setHighlightedProjectId(targetId);

      if (highlightTimer) clearTimeout(highlightTimer);

      let attempts = 0;
      const maxAttempts = 20;
      const scrollToElement = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({
            behavior: "auto",
            block: "center"
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(scrollToElement);
        }
      };
      requestAnimationFrame(scrollToElement);

      highlightTimer = setTimeout(() => {
        setHighlightedProjectId(null);
      }, 1500);
    };

    checkHash();

    const handleHashChange = () => {
      checkHash();
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, [projects]);

  const renderProjectItem = (project: ProjectData, index: number, isOngoingProject: boolean) => {
    const projectId = titleToId(project.title);
    const isHighlighted = highlightedProjectId === projectId;

    return (
      <li key={index} id={projectId}>
        <ProjectCard
          project={project}
          index={index}
          isOngoing={isOngoingProject}
          isHighlighted={isHighlighted}
          memberIds={memberIds}
          alumniIds={alumniIds}
        />
      </li>
    );
  };

  return (
    <div className={className}>
      <div className="mb-6 flex flex-row flex-nowrap items-center justify-between gap-4">
        <p className="text-gray-600">
          Total{" "}
          <span className="font-semibold text-gray-900">{visibleCount}</span>
          {" of "}
          <span className="font-semibold text-gray-900">{allCount}</span>{" "}
          projects
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-gray-700 text-sm md:text-base font-medium">인력양성</span>
          <button
            onClick={() => setShowTalentDevelopment(!showTalentDevelopment)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
              showTalentDevelopment ? "bg-brand-primary" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={showTalentDevelopment}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                showTalentDevelopment ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Ongoing Projects */}
      <div className="mb-12">
        {/* <SectionHeader title="Ongoing" className="" underline={true} size="small"></SectionHeader> */}

        <ul className="space-y-4 md:space-y-5">
          {ongoingProjects.map((project, index) => renderProjectItem(project, index, true))}
        </ul>
      </div>

      {/* Completed Projects */}
      <div>
        <SectionHeader title="Completed" className="" underline={true} size="small"></SectionHeader>

        {completedProjects.length > 0 ? (
          <ul className="space-y-4 md:space-y-5">
            {completedProjects.map((project, index) => renderProjectItem(project, index, false))}
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
