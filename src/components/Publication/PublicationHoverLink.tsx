"use client";

import { HoverCardLink } from "@/components/HoverCardLink";
import type { PublicationPreview } from "@/components/Publication/publicationPreview";

const STATUS_CLASS: Record<string, string> = {
  "In Progress": "bg-blue-500/10 text-blue-600",
  "Under Review": "bg-yellow-500/10 text-yellow-700",
};

function PublicationCard({ preview }: { preview: PublicationPreview }) {
  const venue = preview.venue;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-lg">
      <p className="text-[15px] font-medium leading-snug text-gray-900 line-clamp-3">{preview.title}</p>
      {preview.subtitle ? (
        <p className="mt-0.5 text-[13px] leading-snug text-gray-500 line-clamp-2">{preview.subtitle}</p>
      ) : null}
      {preview.authors.length > 0 ? (
        <p className="mt-1 text-[13px] italic leading-snug text-gray-600 line-clamp-2">
          {preview.authors.map((author, i) => (
            <span key={i}>
              {author.name}
              {author.isCorresponding && "*"}
              {author.isEqualFirst && <sup className="pl-[1px]">‡</sup>}
              {i < preview.authors.length - 1 && ", "}
            </span>
          ))}
        </p>
      ) : null}
      {preview.status || venue || preview.meta ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {preview.status ? (
            <span
              className={`inline-block rounded-full px-2 text-[12px] leading-5 ${
                STATUS_CLASS[preview.status] ?? "bg-brand-primary/10 text-brand-primary"
              }`}
            >
              {preview.status}
            </span>
          ) : null}
          {venue ? (
            <span className="text-[13px] leading-snug text-gray-500">
              {venue.name}
              {venue.acronym ? (
                <>
                  {" "}
                  (<span className="font-semibold">{venue.acronym}</span>)
                </>
              ) : null}
              , {venue.year}
              {venue.paperType ? ` — ${venue.paperType}` : ""}
            </span>
          ) : preview.meta ? (
            <span className="whitespace-pre-line text-[13px] leading-snug text-gray-500">{preview.meta}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** 논문·특허 제목 링크. 클릭하면 해당 목록으로 이동하고, 호버하면 짧은 서지 정보가 뜬다. */
export function PublicationHoverLink({
  preview,
  className,
  children,
}: {
  preview: PublicationPreview;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <HoverCardLink
      href={preview.href}
      className={className}
      panelClassName="w-max max-w-[min(420px,calc(100vw-16px))]"
      card={<PublicationCard preview={preview} />}
    >
      {children}
    </HoverCardLink>
  );
}
