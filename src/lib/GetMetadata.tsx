import {Metadata} from "next";

/**
 * 사이트 기본 메타데이터 설정을 위한 타입 정의
 * 모든 페이지에서 공통으로 사용되는 기본 정보들을 포함
 */
interface MetaConfig {
  readonly title: string;           // 사이트 기본 제목
  readonly siteName: string;        // 사이트 전체 이름
  readonly description: string;     // 사이트 기본 설명
  readonly keyword: readonly string[];  // 기본 키워드 목록
  readonly url: string;            // 사이트 기본 URL
  readonly googleVerification: string;  // Google Search Console 인증 코드
  readonly ogImage: string;        // 기본 OpenGraph 이미지 경로
}

/**
 * 페이지별 메타데이터 생성을 위한 옵션 타입
 * getMetadata 함수에 전달할 수 있는 커스텀 설정들
 */
interface GenerateMetadataProps {
  title?: string;        // 페이지별 제목 (기본 제목과 조합됨)
  description?: string;  // 페이지별 설명 (기본 설명 대신 사용)
  asPath?: string;       // 페이지 경로 (정식 URL 지정, SEO 중복 방지용)
  ogImage?: string;      // 페이지별 OpenGraph 이미지
}

/**
 * GLI Lab 사이트의 기본 메타데이터 설정
 * 모든 페이지에서 공통으로 사용되는 기본값들을 정의
 */
export const META: MetaConfig = {
  title: "GLI Lab",
  siteName: '건국대학교 Graph & Language Intelligence 연구실',
  description:
    '그래프와 텍스트 기반의 인공지능 기술을 연구개발하고 새로운 응용방법(추천, 맞춤형 검색, 챗봇 등)을 찾아내는 것을 목적으로 합니다.',
  keyword: [
    '추천시스템',
    '맞춤형 검색',
    '챗봇',
    'chatbot',
    'recommendation system',
    'personalized search',
    'chatbot',
    '그래프',
    'graph',
    '텍스트',
    'text',
    'language',
    'konkuk university',
    '건국대학교',
    '컴퓨터공학부',
    'AI',
    '인공지능',
    'machine learning',
    'deep learning',
    'NLP',
    'graph neural network',
  ] as const,
  url: 'https://gli.konkuk.ac.kr',
  googleVerification: 'WDBVed74Us47Rx02wLK1aQ6vmJdddImm1sQl2NRnihs',  // Google Search Console → 속성 추가 → HTML 태그에서 content 값 복사
  ogImage: '/images/logo/GLI_opengraph_2000x1050.jpg',
} as const;

/**
 * Next.js Metadata 객체를 생성하는 메인 함수
 * 기본 설정과 페이지별 설정을 조합하여 완전한 메타데이터를 생성
 * 
 * @param metadataProps - 페이지별 커스텀 메타데이터 옵션
 * @returns Next.js Metadata 객체
 * 
 * @example
 * // 기본 메타데이터
 * export const metadata = getMetadata();
 * 
 * @example
 * // 커스텀 메타데이터
 * export const metadata = getMetadata({
 *   title: '연구 프로젝트',
 *   description: '우리 연구실의 최신 프로젝트를 소개합니다.',
 *   asPath: '/research'
 * });
 */
export const getMetadata = (metadataProps?: GenerateMetadataProps): Metadata => {
  const { 
    title, 
    description, 
    asPath, 
    ogImage
  } = metadataProps || {};

  // 제목 생성: 페이지 제목이 있으면 "페이지제목 | 사이트제목" 형태로 조합
  const TITLE = title ? `${title} | ${META.title}` : META.title;
  // 설명: 페이지별 설명이 있으면 사용, 없으면 기본 설명 사용
  const DESCRIPTION = description || META.description;
  // URL: 페이지 경로가 있으면 사용, 없으면 루트 경로
  const PAGE_URL = asPath || '/';
  // 이미지: 페이지별 이미지가 있으면 사용, 없으면 기본 이미지
  const OG_IMAGE = ogImage || META.ogImage;

  // Next.js Metadata 객체 생성
  const metadata: Metadata = {
    // 기본 URL 설정 (상대 경로들의 기준이 됨)
    metadataBase: new URL(META.url),
    
    // SEO를 위한 canonical URL 설정
    alternates: {
      canonical: PAGE_URL,
    },
    
    // 기본 메타 태그들
    title: TITLE,
    description: DESCRIPTION,
    keywords: [...META.keyword],
    
    // 파비콘 설정
    icons: {
      icon: "/images/logo/GLI_logo_green_filled.jpg",
    },
    
    // OpenGraph 태그들 (Facebook, LinkedIn 등에서 사용)
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: META.siteName,
      locale: 'ko_KR',
      type: 'website',
      url: PAGE_URL,
      images: [
        {
          url: OG_IMAGE,
          width: 2000,
          height: 1050,
          alt: TITLE,
        },
      ],
    },
    
    // 검색 엔진 소유권 확인 태그들
    // Google은 Next.js에서 특별히 지원하므로 직접 설정
    // 나머지 검색엔진들은 other 객체에 설정
    verification: {
      google: META.googleVerification
    },
    
    // Twitter Card 설정 (Twitter에서 링크 공유시 사용)
    twitter: {
      card: 'summary_large_image',  // 큰 이미지가 포함된 카드 형태
      title: TITLE,
      description: DESCRIPTION,
      images: [OG_IMAGE],
    },
  };

  return metadata;
};