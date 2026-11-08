import type { PaperTitle, ProfileLinks } from '@/data/loaders/types';

/**
 * 제목 문자열을 URL 해시(`#...`)용 id로 바꾼다.
 * 논문·특허·프로젝트 목록에서 각 항목의 DOM id로 쓰고, 뉴스 본문의 `<paper>제목</>` 같은 마크업이나
 * 프로필 상세의 링크에서 `/publications/papers#<id>` 형태로 해당 항목으로 점프할 때 쓴다.
 *
 * 처리 순서: 소문자화 → 영문·숫자·공백·한글·하이픈 외 제거 → 공백을 `-`로 → 연속 `-` 하나로 → 앞뒤 `-` 제거
 *
 * @param title 예: "Multimodal Tokenization with Multi-aspect Item Graphs for Recommendation"
 *              예: "그래프 패턴 머신 기반 서브구조 복원을 이용한 그래프 노드 이상 탐지"
 *              예: "Temporal Knowledge Graph Forecasting: A Survey (2025)"
 * @returns     예: "multimodal-tokenization-with-multi-aspect-item-graphs-for-recommendation"
 *              예: "그래프-패턴-머신-기반-서브구조-복원을-이용한-그래프-노드-이상-탐지"
 *              예: "temporal-knowledge-graph-forecasting-a-survey-2025"  (`:`, `(`, `)` 제거됨)
 */
export function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, '') // 특수문자 제거 (한글은 유지, 하이픈은 끝에 배치)
    .replace(/\s+/g, '-')                  // 공백을 하이픈으로
    .replace(/-+/g, '-')                   // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, '');                // 앞뒤 하이픈 제거
}

/**
 * 논문 제목이 한/영 객체 형태인지 판별하는 타입 가드.
 * `paper.yaml`의 `title`은 영문 문자열 하나이거나 `{ko, en}` 객체일 수 있다 (`PaperTitle` 타입).
 *
 *   paper.yaml : - title: "Temporal Knowledge Graph Forecasting"            → false (문자열)
 *   paper.yaml : - title:
 *                    ko: 그래프 패턴 머신 기반 서브구조 복원을 이용한 그래프 노드 이상 탐지
 *                    en: Graph Pattern Machine-based Node Anomaly Detection ...  → true (객체)
 *
 * true를 반환하면 TypeScript가 이후 코드에서 `title.ko`, `title.en` 접근을 허용한다.
 */
export function isLocalizedPaperTitle(title: PaperTitle): title is { ko: string; en: string } {
  return typeof title === 'object' && title !== null && 'ko' in title;
}

/**
 * 논문 제목(`PaperTitle`)으로 URL 해시용 id를 만든다. 한/영 객체면 한글 제목 기준.
 * `titleToId`를 논문 제목 타입에 맞게 감싼 것으로, 논문 목록의 DOM id와
 * 프로필 상세의 `/publications/papers#<id>` 링크가 같은 id를 쓰도록 보장한다.
 *
 * @param title 예: "Temporal Knowledge Graph Forecasting"
 *              예: { ko: "그래프 패턴 머신 기반 ...", en: "Graph Pattern Machine-based ..." }
 * @returns     예: "temporal-knowledge-graph-forecasting"
 *              예: "그래프-패턴-머신-기반-..."  (ko 기준)
 */
export function getPaperTitleId(title: PaperTitle): string {
  return titleToId(isLocalizedPaperTitle(title) ? title.ko : title);
}

/**
 * 논문 제목(`PaperTitle`)을 React `key` 등 중복 없는 식별 문자열로 바꾼다.
 * 한/영 객체면 두 제목을 줄바꿈으로 이어 붙여서, 한글 또는 영문 한쪽만 같은 논문끼리도 구분되게 한다.
 * `getPaperTitleId`와 달리 특수문자를 제거하지 않으므로 URL에는 쓰지 않는다.
 *
 * @param title 예: "Temporal Knowledge Graph Forecasting"
 *              예: { ko: "그래프 패턴 머신 기반 ...", en: "Graph Pattern Machine-based ..." }
 * @returns     예: "Temporal Knowledge Graph Forecasting"
 *              예: "그래프 패턴 머신 기반 ...\nGraph Pattern Machine-based ..."
 */
export function getPaperTitleKey(title: PaperTitle): string {
  return isLocalizedPaperTitle(title) ? `${title.ko}\n${title.en}` : title;
}

/**
 * 세미나 제목으로 URL 해시용 id를 만든다. 세미나 목록의 DOM id와
 * 프로필 상세의 `/board/seminar#<id>` 링크에서 쓴다.
 *
 * `seminar.yaml`의 제목에는 줄바꿈용 `\\`와 `<br>` 태그가 들어 있으므로 `titleToId`와 규칙이 다르다:
 * 백슬래시 묶음을 `-`로 → 공백을 `-`로 → 연속 `-` 하나로 → 소문자화. 특수문자와 `<br>` 태그는 제거하지 않는다.
 *
 * @param title 예: "<br>Cross-Architecture Distillation</br> \\\\of LLM Knowledge for Non-LLM Model Enhancement"
 * @returns     예: "seminar-<br>cross-architecture-distillation</br>-of-llm-knowledge-for-non-llm-model-enhancement"
 */
export function getSeminarHashId(title: string): string {
  return `seminar-${title.replace(/\\+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase()}`;
}

/**
 * 프로필 상세 페이지 href (trailing slash 포함). 없으면 null.
 *
 * "사람 ID → 주소" 변환은 서버의 `getProfileLinks()`(src/data/loaders/index.ts)가 한 번에 끝내서
 * `ProfileLinks` 사전으로 만들어 두므로, 여기서는 그 사전에서 O(1)로 꺼내기만 한다.
 * members/alumni 판정, slug 조합, trailing slash 같은 규칙은 전부 `getProfileLinks()`에 있다.
 *
 * `id`는 `src/data/profiles/[YYYY-S] profiles*.yaml`에 정의된 `id` 값이고,
 * 다른 데이터 파일들은 이 값을 `ID` 필드로 참조한다.
 *
 *   profiles.yaml : - id: "[2024.03] 오병국"
 *                     name: {en: Byungkook Oh, ko: 오병국}
 *   paper.yaml    : authors: [{ ID: "[2024.03] 오병국", name: "Byungkook Oh", position: co }]
 *   project.yaml  : managers: [{ ID: "[2025.04] 구본유", name: Bonyou Koo, since: 2026-04 }]
 *   seminar.yaml  : Presenter: { ID: "[2024.06] 서지명", name: Jimyeung Seo (서지명) }
 *   news.yaml     : "<profile=[2024.03] 오병국>오병국</>"  (본문 마크업 안의 ID)
 *
 * @param id    YAML id. 예: "[2024.03] 오병국"
 * @param links `getProfileLinks()` 결과. 클라이언트 컴포넌트는 prop으로 받는다.
 *              예: { "[2024.03] 오병국": "/people/members/2024-03-byungkook-oh/",
 *                    "[2024.07] 지상준": "/people/alumni/2024-07-sangjun-ji/" }
 * @returns "[2024.03] 오병국"   → "/people/members/2024-03-byungkook-oh/"
 *          "[2024.07] 지상준"   → "/people/alumni/2024-07-sangjun-ji/"
 *          "[2020.01] 없는사람" → null  (links가 undefined여도 null)
 */
export function getProfileHref(id: string, links?: ProfileLinks): string | null {
  return links?.[id] ?? null;
}
