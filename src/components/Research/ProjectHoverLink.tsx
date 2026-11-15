"use client";

import { HoverCardLink } from "@/components/HoverCardLink";
import type { ProjectPreview } from "@/components/Research/projectPreview";

/** 하위 항목(가지) 표시용 아이콘. ProjectList의 상위 사업 줄과 같은 모양 */
function SubItemIcon() {
  return (
    <svg
      className="mt-[2px] shrink-0"
      width="13"
      height="13"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 2v6M4 8h5" />
    </svg>
  );
}

function ProjectCard({ preview }: { preview: ProjectPreview }) {
  const typeAndPeriod = [preview.type, preview.period].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-lg">
      <p className="text-[15px] font-medium leading-snug text-gray-900 line-clamp-3">{preview.title}</p>
      {preview.main ? (
        <p className="mt-1 text-[13px] leading-snug text-gray-600 line-clamp-2">{preview.main}</p>
      ) : null}
      {preview.parent ? (
        <p className="mt-0.5 flex items-start gap-1 text-[13px] leading-snug text-gray-500">
          <SubItemIcon />
          <span className="min-w-0 line-clamp-2">{preview.parent}</span>
        </p>
      ) : null}
      {preview.role || typeAndPeriod ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {preview.role ? (
            <span
              className={`inline-block rounded-full px-2 text-[12px] leading-5 ${
                preview.isLead ? "bg-brand-primary/10 text-brand-primary" : "bg-gray-100 text-gray-600"
              }`}
            >
              {preview.role}
            </span>
          ) : null}
          {typeAndPeriod ? (
            <span className="text-[13px] leading-snug text-gray-500">{typeAndPeriod}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** 프로젝트 제목 링크. 클릭하면 프로젝트 목록의 해당 항목으로 이동하고, 호버하면 짧은 과제 정보가 뜬다. */
export function ProjectHoverLink({
  preview,
  className,
  children,
}: {
  preview: ProjectPreview;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <HoverCardLink
      href={preview.href}
      className={className}
      panelClassName="w-max max-w-[min(450px,calc(100vw-16px))]"
      card={<ProjectCard preview={preview} />}
    >
      {children}
    </HoverCardLink>
  );
}
