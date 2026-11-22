"use client";

import { getImageProps } from "next/image";
import { HoverCardLink } from "@/components/HoverCardLink";
import { ProfileCaptainBadge } from "@/components/Profile/ProfileCaptainBadge";
import { formatCaptainPeriod, hasCaptain } from "@/components/Profile/ProfileCaptainText";
import type { ProfileLinkTarget, ProfileLinks } from "@/data/loaders/types";

interface ProfileHoverLinkProps {
  profile: ProfileLinkTarget;
  className?: string;
  children: React.ReactNode;
}

const PHOTO_WIDTH = 96;
const PHOTO_HEIGHT = 118;

/** 가장 긴 직함("Integrated M.S./Ph.D. Student (4학기)")이 한 줄에 들어가는 폭. 공용 기본값 370px에서는 두 줄이 된다. */
const PANEL_CLASS = "w-max max-w-[min(400px,calc(100vw-16px))]";

/**
 * 카드 사진은 항상 칸 폭의 2배(192px) 파일 하나만 쓴다.
 * 후보를 여러 개 주면(srcset) 크롬은 같은 사진의 더 큰 버전이 이미 받아져 있을 때 그것을 골라 쓴다.
 * 멤버 카드나 상세 사진이 떠 있는 페이지, 화면을 확대했다 되돌린 뒤가 그렇다.
 * 300~1920px 파일이 96px 칸에 눌리면 가장자리가 거칠고 날카롭게 보인다.
 * width만 넘기면 next/image 후보는 1배, 2배 두 개이고 src가 그중 2배다.
 * 2배 후보는 next.config.mjs의 images.imageSizes에서 192 이상인 가장 작은 값이다. 목록에 192가 없으면 230이 된다.
 * images.unoptimized가 켜져 있는 동안에는 후보 계산 없이 public 파일이 그대로 쓰인다.
 */
function hoverPhotoSrc(photo: string): string {
  return getImageProps({ src: photo, alt: "", width: PHOTO_WIDTH, height: PHOTO_HEIGHT }).props.src;
}

function ProfileCard({ profile }: { profile: ProfileLinkTarget }) {
  // 캡틴을 맡았던(맡고 있는) 사람의 카드는 바탕을 연한 노란색으로 칠하고, 맨 아래(입학·참여 기간 줄 다음)에 캡틴 기간을 한 줄 넣는다.
  // 노란색은 사진 위 캡틴 배지의 별(amber)과 같은 계열이다
  const captain = hasCaptain(profile.captain) ? profile.captain : undefined;

  // 카드의 테두리와 바탕. 교수는 브랜드 색(초록), 캡틴은 노란색, 나머지는 흰색이다.
  // 교수의 바탕(#f0f5f1)은 브랜드 색을 흰색에 6%쯤 섞은 것으로, 새 소식 띠(NewsPopup)의 바탕과 같다.
  // 카드가 본문 위에 뜨므로 bg-brand-primary/5 같은 반투명 색은 쓸 수 없다 (뒤의 글자가 비친다)
  const tone = profile.isFaculty
    ? "border-brand-primary/30 bg-[#f0f5f1]"
    : captain
      ? "border-amber-300 bg-amber-50"
      : "border-gray-200 bg-white";

  return (
    <div className={`flex items-center gap-2.5 rounded-lg border px-2 py-1.5 shadow-lg ${tone}`}>
      <div className="relative h-[118px] w-[96px] shrink-0 overflow-hidden rounded-md bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hoverPhotoSrc(profile.photo)}
          alt=""
          width={PHOTO_WIDTH}
          height={PHOTO_HEIGHT}
          decoding="async"
          className="h-full w-full object-cover"
        />
        {/* 지금 캡틴인 사람은 프로필 카드처럼 사진 왼쪽 위에 흰 원 안의 별을 단다 (지난 캡틴은 배지가 스스로 그리지 않는다) */}
        {captain ? <ProfileCaptainBadge captain={captain} size="hover" /> : null}
      </div>
      <div className="min-w-0">
        <p className="text-[17.5px] font-medium leading-snug text-gray-900">{profile.nameEn}</p>
        {profile.nameKo ? (
          <p className="text-[15.5px] leading-snug text-gray-600">{profile.nameKo}</p>
        ) : null}
        {profile.title ? (
          <p className="mt-0.5 text-[15px] font-medium leading-snug text-gray-800">{profile.title}</p>
        ) : null}
        {profile.summary ? (
          <p className="mt-0.5 line-clamp-2 text-[14.5px] leading-snug text-gray-500">{profile.summary}</p>
        ) : null}
        {captain ? (
          <p className="mt-0.5 text-[14.5px] font-medium leading-snug text-amber-700">
            Captain: {formatCaptainPeriod(captain)}
          </p>
        ) : null}
        {/* 교수는 맨 아래(소속 줄 다음)에 참여 기간을 "Lab Director: <기간>"으로 초록색 줄에 넣는다. 캡틴 줄과 같은 자리, 같은 꼴이다 */}
        {profile.directorPeriod ? (
          <p className="mt-0.5 text-[14.5px] font-medium leading-snug text-brand-primary">
            Lab Director: {profile.directorPeriod}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 사람 프로필 링크.
 * 클릭하면 기존과 같이 프로필 페이지로 이동하고, 포인터를 올리면 얼굴과 짧은 소개가 뜬다.
 */
export function ProfileHoverLink({ profile, className, children }: ProfileHoverLinkProps) {
  return (
    <HoverCardLink
      href={profile.href}
      className={className}
      card={<ProfileCard profile={profile} />}
      panelClassName={PANEL_CLASS}
    >
      {children}
    </HoverCardLink>
  );
}

/** 프로필이 있는 저자만 링크와 호버 카드로, 없으면 그대로 텍스트로. */
export function ProfileAuthorName({
  authorId,
  name,
  profileLinks,
  className,
}: {
  authorId?: string;
  name: string;
  profileLinks?: ProfileLinks;
  className: string;
}) {
  const profile = authorId ? profileLinks?.[authorId] : undefined;
  if (!profile) return <span className={className}>{name}</span>;

  return (
    <ProfileHoverLink
      profile={profile}
      className={`${className} underline decoration-dotted decoration-gray-400 underline-offset-4 hover:text-brand-primary hover:decoration-solid hover:decoration-brand-primary transition-colors`}
    >
      {name}
    </ProfileHoverLink>
  );
}
