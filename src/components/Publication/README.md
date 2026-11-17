## 목차

- [1) 이 폴더가 하는 일](#1-이-폴더가-하는-일)
- [2) PaperList.tsx](#2-paperlisttsx)
- [3) PatentList.tsx](#3-patentlisttsx)
- [4) PublicationHoverLink.tsx](#4-publicationhoverlinktsx)
- [5) publicationPreview.ts](#5-publicationpreviewts)
  - [5-1) 카드 값을 만드는 시점](#5-1-카드-값을-만드는-시점)
  - [5-2) 쓰는 곳마다 방식이 다른 이유](#5-2-쓰는-곳마다-방식이-다른-이유)
  - [5-3) 논문이 많아졌을 때](#5-3-논문이-많아졌을-때)
  - [5-4) 이 파일을 PublicationHoverLink.tsx와 합치지 않는 이유](#5-4-이-파일을-publicationhoverlinktsx와-합치지-않는-이유)
- [6) 데이터 흐름](#6-데이터-흐름)

## 1) 이 폴더가 하는 일

논문·특허를 화면에 보여 주는 코드가 모여 있는 폴더다. 목록 페이지 두 개와, 다른 페이지에서 논문·특허 제목에 띄우는 호버 카드가 들어 있다.

| 파일 | 역할 | 내용 | 실행 위치 |
| --- | --- | --- | --- |
| `PaperList.tsx` | `/publications/papers` 페이지의 논문 목록 | React 컴포넌트 | 브라우저 전용 (`"use client"`) |
| `PatentList.tsx` | `/publications/patents` 페이지의 특허 목록 | React 컴포넌트 | 브라우저 전용 (`"use client"`) |
| `PublicationHoverLink.tsx` | 논문·특허 제목 링크. 포인터를 올리면 짧은 서지 정보 카드를 띄움 | React 컴포넌트 | 브라우저 전용 (`"use client"`) |
| `publicationPreview.ts` | 논문·특허 데이터를 호버 카드에 필요한 값으로 정리 | 순수 함수와 타입. React 없음 | 서버와 브라우저 양쪽 |

## 2) PaperList.tsx

| 항목 | 내용 |
| --- | --- |
| 내보내는 것 | `PaperList` (default) |
| 받는 값 | `papers` (`getPapers()` 결과), `profileLinks` (`getProfileLinks()` 결과) |
| 쓰는 곳 | `src/app/publications/papers/page.tsx` |

- 게재가 확정된 논문은 연도별로 묶어 보여 주고, In Progress와 Under Review는 따로 켜고 끄는 구역으로 보여 준다.
- 종류(journal, conference)와 범위(international, domestic)로 거를 수 있다.
- 주소에 `#논문제목`이 붙어 들어오면 그 논문으로 스크롤하고 잠깐 강조한다. 다른 페이지의 논문 링크가 이 방식으로 들어온다.
- 논문마다 링크 복사 버튼이 있다.
- 저자 이름은 프로필이 있으면 `ProfileHoverLink`로 연결한다. 교신저자는 `*`, 공동 1저자는 윗첨자 `‡`로 표시한다.
- 연구실이 주도한 게재 확정 논문은 뉴스 목록과 같은 연한 배경으로 강조한다. 판별은 `isLabLedPaper` (`src/lib/utils.ts`)가 저자 정보로 한다: 맨 앞 저자가 연구실 구성원(교수 본인 포함)이거나, 1저자 중에 연구실 구성원이 있고 교신저자도 연구실 구성원인 논문이다.

## 3) PatentList.tsx

| 항목 | 내용 |
| --- | --- |
| 내보내는 것 | `PatentList` (default) |
| 받는 값 | `patents` (`getPatents()` 결과), `profileLinks` (`getProfileLinks()` 결과) |
| 쓰는 곳 | `src/app/publications/patents/page.tsx` |

- 특허를 연도별로 묶어 보여 준다.
- 상태(출원, 등록)와 범위(international, domestic)로 거를 수 있다.
- `#특허제목` 주소로 들어왔을 때의 스크롤·강조와 링크 복사 버튼은 `PaperList`와 같다.

## 4) PublicationHoverLink.tsx

| 항목 | 내용 |
| --- | --- |
| 내보내는 것 | `PublicationHoverLink` |
| 받는 값 | `preview` (`publicationPreview.ts`가 만든 값), `className`, `children` (링크 글자) |
| 쓰는 곳 | 뉴스 목록(`Board/NewsList.tsx`), 뉴스 팝업(`NewsPopup.tsx`), 프로필 상세(`Profile/ProfileDetailPaper.tsx`, `Profile/ProfileDetailPatent.tsx`) |

- 클릭하면 논문·특허 목록의 해당 항목으로 이동한다.
- 카드를 띄우고 위치를 잡는 동작은 공용 컴포넌트 `src/components/HoverCardLink.tsx`가 맡는다. 이 파일은 카드 안의 내용만 그린다.
- 호버가 없는 터치 기기에서는 카드 없이 링크로만 동작한다.

카드에 나오는 내용은 다음과 같다.

| 줄 | 논문 | 특허 |
| --- | --- | --- |
| 제목 | 제목 (한글 제목이 있으면 한글, 그 아래 영문) | 한글 제목, 그 아래 영문 |
| 저자 (이탤릭) | 이름 목록. 교신저자 `*`, 공동 1저자 윗첨자 `‡` | 이름 목록 |
| 마지막 줄 | 학회·저널 이름 (**약어**는 굵게), 연도 — 논문 종류 | 출원번호와 출원일. 등록된 특허는 그 아래 줄에 등록번호와 등록일 |

- 게재가 확정되지 않은 논문은 마지막 줄에 학회 대신 상태 뱃지(In Progress, Under Review)가 나온다.
- 논문 종류는 `paper.yaml`의 `notes.normal`에서 가져온다. `Findings Paper (Acceptance Rate: …)`처럼 적혀 있으면 `Findings Paper`만 보여 주고 Acceptance Rate는 뺀다.

## 5) publicationPreview.ts

| 항목 | 내용 |
| --- | --- |
| 타입 | `PublicationPreview` (카드 한 장), `PublicationPreviewAuthor`, `PublicationPreviewVenue`, `PublicationPreviews` (제목 id로 찾는 사전) |
| 함수 | `paperToPreview(paper)`, `patentToPreview(patent)`, `buildPublicationPreviews(papers, patents)` |
| 쓰는 곳 | 서버: `src/app/page.tsx`, `src/app/board/news/page.tsx` / 브라우저: `Profile/ProfileDetailPaper.tsx`, `Profile/ProfileDetailPatent.tsx` |

- `paperToPreview`, `patentToPreview`는 논문·특허 한 건을 카드 값으로 바꾼다. 프로필 상세처럼 논문 데이터를 이미 갖고 있는 곳에서 바로 쓴다.
- `buildPublicationPreviews`는 전체 논문·특허를 한 번에 바꿔 사전으로 만든다. 뉴스처럼 본문에 제목만 적혀 있는 곳에서, 제목으로 카드 값을 찾을 때 쓴다. 사전의 키는 `titleToId`, `getPaperTitleId` (`src/lib/utils.ts`) 결과다.

### 5-1) 카드 값을 만드는 시점

호버할 때 만드는 것이 아니라 페이지를 그릴 때 미리 만든다. 호버는 만들어 둔 값을 보여 주기만 한다.

| 쓰는 곳 | 호출 함수 | 만드는 시점 | 만드는 위치 |
| --- | --- | --- | --- |
| 홈, 뉴스 페이지 | `buildPublicationPreviews` | 빌드할 때 (배포 시 1번) | 서버 |
| 프로필 상세의 논문·특허 목록 | `paperToPreview`, `patentToPreview` | 그 목록이 화면에 그려질 때마다 | 방문자 브라우저 |

- 홈과 뉴스는 정적 페이지라 `next build` 때 한 번 그려진다. `paper.yaml`, `patent.yaml`을 고치면 다시 빌드·배포해야 카드에 반영된다. 정적 페이지가 다시 그려지는 조건은 `src/data/README.md`의 3)을 참고한다.
- 개발 서버(`next dev`)에서는 요청마다 다시 그리므로 새로고침하면 바로 반영된다.

### 5-2) 쓰는 곳마다 방식이 다른 이유

- **프로필 상세**는 사람별 논문 목록을 직접 그려야 해서 논문 원본 데이터를 이미 브라우저에 받아 두고 있다. 카드 값은 그 데이터에서 바로 계산하면 되므로 따로 보낼 것이 없다.
- **뉴스**는 본문에 논문 제목만 적혀 있다. 브라우저에서 계산하려면 논문 원본 데이터를 전부 보내야 하는데, 원본(논문 1건당 약 770바이트)이 카드 값(약 575바이트)보다 크다. 그래서 서버에서 카드 값으로 줄여서 보낸다.

### 5-3) 논문이 많아졌을 때

홈과 뉴스 페이지는 뉴스에 언급되지 않은 것까지 전체 논문·특허의 카드 값을 페이지에 담아 보낸다. 만드는 시간은 문제가 되지 않지만, 페이지 용량이 전체 논문 수에 비례해 늘어난다.

| | 논문 52건 (2026년 11월) | 논문 1000건 (추정) |
| --- | --- | --- |
| 카드 데이터 크기 | 약 30KB | 약 560KB |
| 압축 전송 시 | 약 4KB | 약 80KB |

논문이 200건쯤 되면(압축 기준 15KB 이상) "그 페이지의 뉴스에서 실제로 언급된 논문·특허의 카드 값만 담기"로 바꾸는 것을 검토한다. 2026년 11월 기준으로 뉴스가 언급하는 논문은 52건 중 15건이다.

바꿀 때 주의할 점은 다음과 같다.

- 뉴스 본문의 `<paper>`, `<patent>` 태그에서 제목을 뽑아 id로 바꾸는 규칙이 서버(골라내기)와 화면(링크 그리기) 두 곳에 생긴다. 공용 함수 하나로 묶어 어긋나지 않게 한다.
- 어긋나도 오류는 나지 않고 카드만 뜨지 않는다. 링크는 정상 동작하므로 알아채기 어렵다.
- 홈의 뉴스 팝업도 같은 사전에서 카드를 찾으므로 팝업에 나오는 논문도 함께 담아야 한다.

### 5-4) 이 파일을 PublicationHoverLink.tsx와 합치지 않는 이유

`PublicationHoverLink.tsx`는 `"use client"`가 붙은 브라우저 전용 파일이다. 서버 컴포넌트는 그런 파일 안의 함수를 직접 실행할 수 없다. 그런데 홈과 뉴스 페이지는 서버에서 `buildPublicationPreviews`를 호출하므로, 이 함수들은 `"use client"`가 없는 별도 파일에 있어야 한다.

## 6) 데이터 흐름

1. 서버 페이지가 `getPapers()`, `getPatents()`로 데이터를 읽는다 (`src/data/loaders`).
2. 목록 페이지는 그 데이터를 `PaperList`, `PatentList`에 그대로 넘긴다.
3. 호버 카드가 필요한 페이지는 `publicationPreview.ts`로 카드 값을 만들어 `PublicationHoverLink`에 넘긴다.
