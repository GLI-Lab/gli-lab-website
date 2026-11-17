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
  appendSiteTitle?: boolean;  // 제목 뒤에 " | GLI Lab"을 붙일지 (기본 true). 프로필·앨범처럼 특정 개체의 URL은 false로 둔다
  description?: string;  // 페이지별 설명 (기본 설명 대신 사용)
  asPath: string;        // 페이지 경로 (필수). og:url과 canonical에 들어간다. 빠뜨리면 홈('/')으로 표기되므로 필수로 둔다
  ogImage?: string;      // 페이지별 OpenGraph 이미지
}

/**
 * GLI Lab 사이트의 기본 메타데이터 설정
 * 모든 페이지에서 공통으로 사용되는 기본값들을 정의
 */
export const META: MetaConfig = {
  title: "GLI Lab",
  siteName: '건국대학교 컴퓨터공학부 Graph & Language Intelligence Lab',
  description:
    '그래프와 텍스트 기반의 인공지능 기술을 연구개발하고 새로운 응용방법(언어모델·그래프 융합, 그래프 예측·분석, 자연어처리, 추천시스템, 이상탐지 등)을 찾아내는 것을 목적으로 합니다.',
  keyword: [
    '추천시스템',
    '맞춤형 검색',
    '챗봇',
    'chatbot',
    'recommendation system',
    'personalized search',
    '그래프',
    'graph',
    '텍스트',
    'text',
    'language',
    'konkuk university',
    '건국대학교',
    '컴퓨터공학부',
    '컴퓨터공학과',
    'computer science',
    'computer engineering',
    'computer science and engineering',
    "인공지능학과",
    "artificial intelligence",
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
 * // 기본 메타데이터 (홈)
 * export const metadata = getMetadata({ asPath: '/' });
 * 
 * @example
 * // 커스텀 메타데이터
 * export const metadata = getMetadata({
 *   title: '연구 프로젝트',
 *   description: '우리 연구실의 최신 프로젝트를 소개합니다.',
 *   asPath: '/research'
 * });
 */
export const getMetadata = (metadataProps: GenerateMetadataProps): Metadata => {
  const {
    title,
    appendSiteTitle = true,
    description,
    asPath,
    ogImage
  } = metadataProps;

  // 제목 생성: 페이지 제목이 있으면 "페이지제목 | 사이트제목" 형태로 조합
  // appendSiteTitle이 false면 페이지 제목만 쓴다 (특정 사람·앨범 등 개체 하나를 가리키는 URL).
  const TITLE = !title ? META.title : appendSiteTitle ? `${title} | ${META.title}` : title;
  // 설명: 페이지별 설명이 있으면 사용, 없으면 기본 설명 사용
  const DESCRIPTION = description || META.description;
  // URL: 페이지 경로 (끝 슬래시는 next.config의 trailingSlash 설정에 따라 Next.js가 붙인다)
  const PAGE_URL = asPath;
  // 이미지: 페이지별 이미지가 있으면 사용, 없으면 기본 이미지
  const OG_IMAGE = ogImage || META.ogImage;
  
  // 이미지 크기: 미리 만들어 둔 이미지만 크기를 안다 (기본 로고 2000x1050, 프로필 OG 1200x630).
  // 그 밖의 이미지(갤러리 사진 등)는 사진마다 크기가 달라 width/height를 생략한다.
  // 생략하면 공유하는 쪽(카카오톡, 슬랙 등)이 이미지를 받아 직접 크기를 읽는다.
  let imageSize: { width?: number; height?: number } = {};
  if (OG_IMAGE === META.ogImage) {
    imageSize = { width: 2000, height: 1050 };
  } else if (OG_IMAGE.includes('/images/profiles-og/')) {
    imageSize = { width: 1200, height: 630 };
  }

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
          ...imageSize,
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