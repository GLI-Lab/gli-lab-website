"use client";

import { getImageProps } from "next/image";
import { HoverCardLink } from "@/components/HoverCardLink";
import type { ProfileLinkTarget, ProfileLinks } from "@/data/loaders/types";

interface ProfileHoverLinkProps {
  profile: ProfileLinkTarget;
  className?: string;
  children: React.ReactNode;
}

const PHOTO_WIDTH = 88;
const PHOTO_HEIGHT = 108;

/**
 * 카드 사진은 항상 칸 폭의 2배(176px) 파일 하나만 쓴다.
 * 후보를 여러 개 주면(srcset) 크롬은 같은 사진의 더 큰 버전이 이미 받아져 있을 때 그것을 골라 쓴다.
 * 멤버 카드나 상세 사진이 떠 있는 페이지, 화면을 확대했다 되돌린 뒤가 그렇다.
 * 300~1920px 파일이 88px 칸에 눌리면 가장자리가 거칠고 날카롭게 보인다.
 * width만 넘기면 next/image 후보는 1배, 2배 두 개이고 src가 그중 2배다.
 */
function hoverPhotoSrc(photo: string): string {
  return getImageProps({ src: photo, alt: "", width: PHOTO_WIDTH, height: PHOTO_HEIGHT }).props.src;
}

function ProfileCard({ profile }: { profile: ProfileLinkTarget }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-lg">
      <div className="h-[108px] w-[88px] shrink-0 overflow-hidden rounded-md bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hoverPhotoSrc(profile.photo)}
          alt=""
          width={PHOTO_WIDTH}
          height={PHOTO_HEIGHT}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[16.5px] font-medium leading-snug text-gray-900">{profile.nameEn}</p>
        {profile.nameKo ? (
          <p className="text-[14.5px] leading-snug text-gray-600">{profile.nameKo}</p>
        ) : null}
        {profile.title ? (
          <p className="mt-0.5 text-[14px] font-medium leading-snug text-gray-800">{profile.title}</p>
        ) : null}
        {profile.summary ? (
          <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-gray-500">{profile.summary}</p>
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
    <HoverCardLink href={profile.href} className={className} card={<ProfileCard profile={profile} />}>
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
      className={`${className} decoration-gray-500 underline underline-offset-[3px] hover:text-brand-primary hover:decoration-brand-primary transition-colors`}
    >
      {name}
    </ProfileHoverLink>
  );
}
