import {Metadata} from "next";

interface generateMetadataProps {
  title?: string;
  description?: string;
  asPath?: string;
  ogImage?: string;
}

export const META = {
  title: "GLI Lab",
  siteName: '건국대학교 Graph & Language Intelligence 연구실',
  description:
    '그래프와 텍스트 기반의 인공지능 기술을 연구개발하고 새로운 응용방법을 찾아내는 것을 목적으로 합니다.',
  keyword: [
    '그래프',
    'graph',
    '텍스트',
    'text',
    'language',
    'konkuk university',
    '건국대학교',
    '컴퓨터공학부',
  ],
  url: 'https://gli.konkuk.ac.kr',
  googleVerification: 'xxx',
  naverVerification: 'xxx',
  ogImage: '/GLI_opengraph_2000x1050.jpg',
} as const;

export const getMetadata = (metadataProps?: generateMetadataProps) => {  // ? 기호는 이 인자가 선택적
  // Next.js 공식 가이드: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  // https://assets.velcdn.com/@doeunnkimm_/%EB%8F%99%EC%A0%81%EC%9C%BC%EB%A1%9C-mete%EC%99%80-og%ED%83%9C%EA%B7%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-opengraph-image%EA%B9%8C%EC%A7%80
  const { title, description, asPath, ogImage } = metadataProps || {};

  // 아무 것도 넘기지 않고 호출했을 때는 default META 값으로 설정
  const TITLE = title ? `${META.title} | ${title}` : META.title;
  const DESCRIPTION = description || META.description;
  const PAGE_URL = asPath ? asPath : '/';
  const OG_IMAGE = ogImage || META.ogImage;

  const metadata: Metadata = {
    metadataBase: new URL(META.url), // 상대 경로 사용 (https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase)
    alternates: {
      canonical: PAGE_URL, // 원본 URL 명시 (연구실 홈페이지는 메인만 필요함)
    },
    title: TITLE,
    description: DESCRIPTION,
    keywords: [...META.keyword],
    icons: {
      icon: "/GLI_logo_green_filled.jpg",
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: TITLE,
      locale: 'ko_KR',
      type: 'website',
      url: PAGE_URL,
      images: {
        url: OG_IMAGE,
      },
    },
    verification: {
      google: META.googleVerification,
      other: {
        'naver-site-verification': META.naverVerification,
      },
    },
    twitter: {
      title: TITLE,
      description: DESCRIPTION,
      images: {
        url: OG_IMAGE,
      },
    },
  };

  return metadata;
};
