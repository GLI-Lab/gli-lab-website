## 목차

- [1) 이 폴더가 하는 일](#1-이-폴더가-하는-일)
- [2) ProjectList.tsx](#2-projectlisttsx)
- [3) ProjectHoverLink.tsx](#3-projecthoverlinktsx)
- [4) projectPreview.ts](#4-projectpreviewts)
  - [4-1) 카드 값을 만드는 시점](#4-1-카드-값을-만드는-시점)
  - [4-2) 이 파일을 ProjectHoverLink.tsx와 합치지 않는 이유](#4-2-이-파일을-projecthoverlinktsx와-합치지-않는-이유)
- [5) 데이터 흐름](#5-데이터-흐름)

## 1) 이 폴더가 하는 일

연구 과제(프로젝트)를 화면에 보여 주는 코드가 모여 있는 폴더다. 목록 페이지 하나와, 다른 페이지에서 프로젝트 제목에 띄우는 호버 카드가 들어 있다.

| 파일 | 역할 | 내용 | 실행 위치 |
| --- | --- | --- | --- |
| `ProjectList.tsx` | `/research/projects` 페이지의 프로젝트 목록 | React 컴포넌트 | 브라우저 전용 (`"use client"`) |
| `ProjectHoverLink.tsx` | 프로젝트 제목 링크. 포인터를 올리면 짧은 과제 정보 카드를 띄움 | React 컴포넌트 | 브라우저 전용 (`"use client"`) |
| `projectPreview.ts` | 프로젝트 데이터를 호버 카드에 필요한 값으로 정리. 목록과 같이 쓰는 표기 함수도 있음 | 순수 함수와 타입. React 없음 | 서버와 브라우저 양쪽 |

논문·특허 쪽의 같은 구조는 `src/components/Publication/README.md`에 있다.

## 2) ProjectList.tsx

| 항목 | 내용 |
| --- | --- |
| 내보내는 것 | `ProjectList` (default) |
| 받는 값 | `projects` (`getProjects()` 결과), `profileLinks` (`getProfileLinks()` 결과) |
| 쓰는 곳 | `src/app/research/projects/page.tsx` |

- 종료일이 지나지 않은 과제를 먼저 보여 주고, 끝난 과제는 Completed 구역에 따로 보여 준다.
- 인력양성 과제는 스위치로 숨기거나 보이게 할 수 있다.
- 과제 카드에는 역할 뱃지, 제목, 주관 기관과 사업명, 상위 기관과 사업명, 과제 유형, 기간이 나온다. 넓은 화면에서는 기관 로고도 나온다.
- 사람이 연결된 과제는 카드를 누르면 실무책임자(현재, 이전)와 참여자 명단이 펼쳐진다. 이름은 프로필이 있으면 `ProfileHoverLink`로 연결한다.
- 주소에 `#프로젝트제목`이 붙어 들어오면 그 과제로 스크롤하고 잠깐 강조한다. 다른 페이지의 프로젝트 링크가 이 방식으로 들어온다.
- 시작한 지 6개월이 안 된 진행 중 과제에는 New 표시가 붙는다.

## 3) ProjectHoverLink.tsx

| 항목 | 내용 |
| --- | --- |
| 내보내는 것 | `ProjectHoverLink` |
| 받는 값 | `preview` (`projectPreview.ts`가 만든 값), `className`, `children` (링크 글자) |
| 쓰는 곳 | 뉴스 목록(`Board/NewsList.tsx`), 뉴스 팝업(`NewsPopup.tsx`), 프로필 상세(`Profile/ProfileDetailProject.tsx`) |

- 클릭하면 프로젝트 목록의 해당 과제로 이동한다.
- 카드를 띄우고 위치를 잡는 동작은 공용 컴포넌트 `src/components/HoverCardLink.tsx`가 맡는다. 이 파일은 카드 안의 내용만 그린다.
- 호버가 없는 터치 기기에서는 카드 없이 링크로만 동작한다.
- 뉴스 팝업은 지금 논문만 띄우도록 설정돼 있어서(`src/app/page.tsx`의 `kinds: ["paper"]`) 프로젝트 카드가 실제로 나오지는 않는다. 프로젝트를 팝업에 넣으면 바로 동작한다.

카드에 나오는 내용은 다음과 같다.

| 줄 | 내용 | 예 |
| --- | --- | --- |
| 제목 | 과제 제목 | 그래프기반 위협추적 분석 |
| 주관 | 주관 기관 › 사업명 | LIG넥스원 |
| 상위 | 가지 아이콘과 함께 상위 기관 › 사업명. 없으면 줄이 빠짐 | 국방과학연구소 › 사이버 전장관리체계 … |
| 마지막 줄 | 역할 뱃지, 과제 유형 · 기간 | 연구책임자 / 산업체·위탁 · 2025.10 ~ 2027.05 |

- 역할 뱃지는 연구책임자, 공동연구자, 참여연구자일 때만 나온다. `연구책임자(학생)`처럼 괄호가 붙어도 같은 뱃지로 취급한다. 연구책임자는 강조색, 나머지는 회색이다.
- 주관 기관이 없고 상위 기관만 있는 과제는 상위 기관이 주관 줄에 나온다.
- 기관 로고와 참여자 명단은 카드에 넣지 않았다.

## 4) projectPreview.ts

| 항목 | 내용 |
| --- | --- |
| 타입 | `ProjectPreview` (카드 한 장), `ProjectPreviews` (제목 id로 찾는 사전) |
| 카드 값 함수 | `projectToPreview(project)`, `buildProjectPreviews(projects)` |
| 표기 함수 | `roleBadgeKey(role)`, `formatDateRange(start, end)` |
| 쓰는 곳 | 서버: `src/app/page.tsx`, `src/app/board/news/page.tsx` / 브라우저: `Profile/ProfileDetailProject.tsx`, `ProjectList.tsx` |

- `projectToPreview`는 과제 한 건을 카드 값으로 바꾼다. 프로필 상세처럼 과제 데이터를 이미 갖고 있는 곳에서 바로 쓴다.
- `buildProjectPreviews`는 전체 과제를 한 번에 바꿔 사전으로 만든다. 뉴스처럼 본문에 제목만 적혀 있는 곳에서, 제목으로 카드 값을 찾을 때 쓴다. 사전의 키는 `titleToId` (`src/lib/utils.ts`) 결과다.
- `roleBadgeKey`와 `formatDateRange`는 목록(`ProjectList.tsx`)과 호버 카드가 역할 뱃지와 기간을 같은 규칙으로 표기하도록 함께 쓴다.

### 4-1) 카드 값을 만드는 시점

호버할 때 만드는 것이 아니라 페이지를 그릴 때 미리 만든다. 호버는 만들어 둔 값을 보여 주기만 한다.

| 쓰는 곳 | 호출 함수 | 만드는 시점 | 만드는 위치 |
| --- | --- | --- | --- |
| 홈, 뉴스 페이지 | `buildProjectPreviews` | 빌드할 때 (배포 시 1번) | 서버 |
| 프로필 상세의 프로젝트 목록 | `projectToPreview` | 그 목록이 화면에 그려질 때마다 | 방문자 브라우저 |

- 홈과 뉴스는 정적 페이지라 `project.yaml`을 고치면 다시 빌드·배포해야 카드에 반영된다.
- 홈과 뉴스 페이지에는 전체 과제의 카드 값이 담겨 간다. 과제는 16건(2026년 11월)이라 용량 부담이 없다. 방식이 이렇게 나뉜 이유와 건수가 많아졌을 때의 대안은 `src/components/Publication/README.md`의 5-2), 5-3)과 같다.

### 4-2) 이 파일을 ProjectHoverLink.tsx와 합치지 않는 이유

`ProjectHoverLink.tsx`는 `"use client"`가 붙은 브라우저 전용 파일이다. 서버 컴포넌트는 그런 파일 안의 함수를 직접 실행할 수 없다. 그런데 홈과 뉴스 페이지는 서버에서 `buildProjectPreviews`를 호출하므로, 이 함수들은 `"use client"`가 없는 별도 파일에 있어야 한다.

## 5) 데이터 흐름

1. 서버 페이지가 `getProjects()`로 데이터를 읽는다 (`src/data/loaders`).
2. 목록 페이지는 그 데이터를 `ProjectList`에 그대로 넘긴다.
3. 호버 카드가 필요한 페이지는 `projectPreview.ts`로 카드 값을 만들어 `ProjectHoverLink`에 넘긴다.
