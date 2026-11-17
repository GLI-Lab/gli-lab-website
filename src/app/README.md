## 목차

- [1) 이 문서가 다루는 것](#1-이-문서가-다루는-것)
- [2) 종류별 비교](#2-종류별-비교)
- [3) 공유 카드에 나오는 내용](#3-공유-카드에-나오는-내용)
- [4) 프로필](#4-프로필)
- [5) 갤러리 앨범](#5-갤러리-앨범)
- [6) 논문·특허](#6-논문특허)
  - [6-1) 만든 이유](#6-1-만든-이유)
  - [6-2) 동작 방식](#6-2-동작-방식)
  - [6-3) 세 가지 방식 비교](#6-3-세-가지-방식-비교)
  - [6-4) 동적 렌더링을 고른 이유](#6-4-동적-렌더링을-고른-이유)
  - [6-5) 정적으로 바꿀 때 확인할 것](#6-5-정적으로-바꿀-때-확인할-것)
- [7) canonical](#7-canonical)
- [8) 알아둘 제약](#8-알아둘-제약)
- [9) 페이지별 공유 카드 실제 결과](#9-페이지별-공유-카드-실제-결과)
  - [9-1) 목록 페이지](#9-1-목록-페이지)
  - [9-2) 개별 항목](#9-2-개별-항목)
  - [9-3) 주소 태그](#9-3-주소-태그)
  - [9-4) 다시 확인하는 방법](#9-4-다시-확인하는-방법)

## 1) 이 문서가 다루는 것

프로필, 갤러리 앨범, 논문·특허는 목록 페이지 안의 항목 하나하나에 자기 주소가 있다. 이 문서는 그 주소가 어떻게 만들어지는지, 종류마다 구조가 왜 다른지를 적는다.

**요약** (2026년 11월 기준. 논문 52건, 특허 14건, 앨범 25개)

- **논문·특허**: 목록 주소는 정적, 개별 주소만 동적이다. 본문이 같은 복사본을 만들지 않고, 비용은 누가 개별 주소를 열 때만 든다. 자세한 내용은 6)에 있다.
- **프로필·갤러리**: 목록 주소와 개별 주소가 모두 동적이다. 구조는 이전과 같고, 2026년 11월에 공유 카드의 제목·설명만 정리했다. 자세한 내용은 4), 5)에 있다.
- **공유 카드**: 세 종류 모두 항목마다 제목·설명이 다르게 나온다. canonical은 그 주소에서만 볼 수 있는 내용이 있는지에 따라 정했다. 자세한 내용은 3), 7)에 있다.

지금의 데이터 규모와 방문량에서는 이 구조가 맞다고 판단했다. 논문·특허 개별 주소를 정적으로 바꾸는 것을 다시 검토할 조건은 6-4)에 있다.

항목마다 주소를 두는 가장 큰 이유는 공유 카드(Open Graph)다. 링크를 카카오톡 등에 붙이면 그 서비스의 크롤러가 주소를 요청해 `<head>`의 제목·설명·이미지 태그를 읽는다. 크롤러에 전달되는 것은 주소의 경로와 `?` 뒤까지이고, `#` 뒤는 전달되지 않는다. 그래서 항목별 카드를 내려면 항목을 구분하는 값이 경로에 있어야 한다.

관련 문서는 다음과 같다.

| 내용 | 문서 |
| --- | --- |
| 정적·동적 페이지의 캐시 동작 | `src/data/README.md`의 3), 4) |
| 프로필 공유 카드 이미지를 만드는 스크립트 | `scripts/README.md`의 5) |
| 논문·특허 목록 컴포넌트 | `src/components/Publication/README.md` |
| 메타데이터를 만드는 공용 함수 | `src/lib/GetMetadata.tsx`의 `getMetadata` |

## 2) 종류별 비교

2026년 11월 기준이다.

| 항목 | 프로필 | 갤러리 앨범 | 논문·특허 |
| --- | --- | --- | --- |
| 주소 예시 | `/people/members/2024-03-byungkook-oh/` | `/board/gallery/2026-08-28-2/` | `/publications/papers/temporal-knowledge-graph-forecasting/` |
| slug를 만드는 값 | YAML id의 합류 연월과 영문 이름 (`generateProfileSlug`) | 앨범 날짜와 같은 날 폴더의 순번 (`toGallerySlug`) | 제목 (`getPaperTitleId`, 특허는 `titleToId(title.ko)`). 한글 제목이면 slug도 한글 |
| 라우트 파일 | `[[...slug]]/page.tsx` 하나가 목록 주소와 개별 주소를 모두 받음 | 프로필과 같음 | `page.tsx`(목록 주소)와 `[slug]/page.tsx`(개별 주소)로 나눔 |
| 목록을 그리는 곳 | `layout.tsx` (`ProfileCards`) | `layout.tsx` (`GalleryGrid`) | `layout.tsx` (`PaperList`, `PatentList`) |
| 목록 주소의 렌더링 | 동적 | 동적 | 정적 (1시간마다 갱신) |
| 개별 주소의 렌더링 | 동적 | 동적 | 동적 |
| 개별 주소에서 서버가 보내는 본문 | 사람마다 다름. 그 사람의 상세가 들어 있음 | 모든 앨범이 같음 | 모든 항목이 같음. 목록 주소와도 같음 |
| 브라우저가 주소를 읽고 하는 일 | 그 사람을 선택. 모바일에서는 `?detail=1`이면 상세 팝업을 엶 | 그 앨범 위치로 스크롤. `?detail=1`이면 앨범 모달을 엶 | 그 항목으로 스크롤하고 잠깐 강조 |
| 주소 뒤에 붙는 값 | `?view=list`, `?detail=1`, `?cols=1` | `?detail=1` | 없음 |
| 링크 복사 버튼이 복사하는 주소 | `…/<slug>/?detail=1` (1단 카드면 `&cols=1` 추가) | `…/<slug>/?detail=1` | `…/<slug>/` |
| 없는 slug로 들어왔을 때 | 목록으로 리다이렉트 | 목록으로 리다이렉트 | 목록으로 리다이렉트 |
| canonical (7) | 자기 주소 | 자기 주소 | 목록 주소 |

- **정적**은 빌드할 때 페이지를 미리 만들어 두고 그대로 보내는 방식이고, **동적**은 요청이 올 때마다 서버(Vercel 함수)가 페이지를 만드는 방식이다. `next build`의 경로 표에서 `○`가 정적, `ƒ`가 동적이다.
- 세 종류 모두 목록은 `layout.tsx`가 그리고, `page.tsx`는 메타데이터와 없는 slug 처리만 맡는다. 주소가 바뀌어도 목록이 다시 그려지지 않게 하려는 구조다.

## 3) 공유 카드에 나오는 내용

공통 규칙은 다음과 같다.

- **목록 페이지**: 제목은 `섹션 이름 | GLI Lab`, 설명은 그 페이지에 무엇이 있는지 적은 한 문장이다. 이미지는 사이트 기본 로고이고, 갤러리 목록만 가장 최근 앨범의 첫 사진이다.
- **개별 항목**: 제목에 `| GLI Lab`을 붙이지 않는다 (`getMetadata`의 `appendSiteTitle: false`). 설명은 그 항목의 핵심 속성만 적는다.
- **카드 내용은 slug로만 정해진다.** `?detail=1`, `?cols=1`, `?view=list`가 붙어도 제목·설명·이미지는 같다.
- **`asPath`는 필수다.** `og:url`과 canonical에 들어간다. 빠뜨리면 타입 오류가 난다.

| 종류 | 제목 | 설명 | 이미지 |
| --- | --- | --- | --- |
| 재학생 프로필 | `영문 이름 (한글 이름)` | `과정 (학기) \| Joined 합류 연월`. 예: `M.S. Student (4학기) \| Joined 2024.06` | 미리 만들어 둔 프로필 카드 이미지 (1200×630) |
| 졸업생 프로필 | `영문 이름 (한글 이름)` | `과정 \| 재적 기간`. 예: `Undergraduate Student \| 2024.06 - 2026.04` | 재학생과 같음 |
| 갤러리 앨범 | 앨범 제목 | `날짜 \| 앨범 설명의 첫 문장`. 첫 문장이 120자를 넘으면 자르고 `…`를 붙임 | 그 앨범의 첫 사진 |
| 논문 | 논문 제목 (한글 제목이 있으면 한글) | `학회·저널 연도 \| 저자`. 게재 확정 전이면 학회 자리에 `Under Review`, `In Progress` | 사이트 기본 로고 |
| 특허 | 한글 제목 | `등록(또는 출원) 번호 (날짜) \| 발명자` | 사이트 기본 로고 |

페이지별로 실제 어떤 값이 나오는지는 9)에 있다. 카드 내용을 만드는 코드는 종류마다 다음 파일에 있다.

| 종류 | 파일 |
| --- | --- |
| 프로필 | `src/app/people/_lib/peoplePage.tsx` |
| 갤러리 앨범 | `src/app/board/gallery/_lib/galleryPage.tsx` |
| 논문·특허 | `src/app/publications/_lib/publicationPage.tsx` |

## 4) 프로필

| 파일 | 하는 일 |
| --- | --- |
| `src/app/people/members/layout.tsx`, `alumni/layout.tsx` | 프로필 목록(`ProfileCards`)을 그린다 |
| `src/app/people/members/[[...slug]]/page.tsx`, `alumni/[[...slug]]/page.tsx` | 목록 주소와 개별 주소를 모두 받는다. 메타데이터를 만들고 없는 slug는 목록으로 보낸다 |
| `src/app/people/_lib/` | 위 파일들이 함께 쓰는 실제 로직 |
| `src/lib/profileSlug.ts` | slug와 주소를 만든다 |

- **서버가 보내는 본문이 사람마다 다르다.** `ProfileCards`가 주소의 slug로 선택된 사람을 정하고 그 사람의 상세(과정, 연구 주제, 논문 목록 등)를 함께 그린다. 서버에서 그릴 때도 주소를 알고 있으므로 응답에 그 내용이 들어간다. 목록 주소에서는 기본으로 선택되는 사람(멤버 페이지는 교수)의 상세가 들어간다.
- **주소 뒤의 값은 화면 상태다.** `?view=list`는 목록형 보기, `?detail=1`은 모바일의 상세 팝업, `?cols=1`은 1단 카드 보기다. 브라우저의 `ProfileCards`가 읽는다.
- **동적인 이유**는 `page.tsx`의 `export const dynamic = 'force-dynamic'`이다. 그 줄을 지워도 그대로는 정적이 되지 않는다. 서버에서 `?view=`를 읽어 canonical과 리다이렉트 주소를 만들고 있어서, Next.js가 요청마다 그려야 하는 페이지로 판단한다.

## 5) 갤러리 앨범

| 파일 | 하는 일 |
| --- | --- |
| `src/app/board/gallery/layout.tsx` | 갤러리(`GalleryGrid`)를 그린다 |
| `src/app/board/gallery/[[...slug]]/page.tsx` | 목록 주소와 개별 주소를 모두 받는다. 메타데이터를 만들고 없는 slug는 목록으로 보낸다 |
| `src/app/board/gallery/_lib/galleryPage.tsx` | 위 파일이 쓰는 실제 로직 |
| `src/components/Gallery/gallerySlug.ts` | slug와 주소를 만든다 |

- **서버가 보내는 본문은 모든 앨범이 같다.** 앨범 모달은 서버 응답에 없고, 브라우저의 `GalleryGrid`가 주소를 읽고 나서 연다.
- **`?detail=1`이 있어야 모달이 열린다.** 앨범 카드를 클릭하면 주소가 `…/<slug>/?detail=1`이 된다. 모달의 제목 옆에 있는 링크 복사 버튼도 이 주소를 복사한다. 모달을 닫으면 `?detail=1`이 빠진 `…/<slug>/`가 되고, 이 주소로 들어오면 그 앨범 위치로 스크롤만 한다.
- **동적인 이유**는 `page.tsx`의 `force-dynamic`이다. 요청마다 `public/images/gallery` 폴더를 읽는다. 주석의 "즉각 업데이트 가능"에 대해서는 `src/data/README.md`의 4)에 설명이 있다.

## 6) 논문·특허

2026년 11월에 `#` 방식에서 개별 주소 방식으로 바꿨다.

```
/publications/papers/                                        목록
/publications/papers/temporal-knowledge-graph-forecasting/   개별 논문
/publications/patents/<slug>/                                개별 특허
```

### 6-1) 만든 이유

목적은 하나다. 논문 링크를 공유했을 때 카드에 그 논문의 제목·학회·저자가 나오게 하는 것이다.

이전에는 `/publications/papers#<id>`처럼 `#` 뒤에 논문 id를 붙였다. `#` 뒤는 크롤러에 전달되지 않으므로 어떤 논문 링크를 공유해도 카드는 목록 페이지의 `Papers | GLI Lab`이었고, `#` 방식으로는 이것을 바꿀 방법이 없다.

### 6-2) 동작 방식

어느 주소로 들어와도 본문은 전체 목록이다. 개별 주소에서 달라지는 것은 `<head>`의 제목·설명 태그와, 브라우저가 스크롤하는 위치뿐이다.

| 파일 | 하는 일 |
| --- | --- |
| `src/app/publications/papers/layout.tsx` | 목록(`PaperList`)을 그린다. 목록 주소의 메타데이터도 여기 있다 |
| `src/app/publications/papers/page.tsx` | 내용은 없다. 이 파일이 있어야 목록 주소가 열린다 |
| `src/app/publications/papers/[slug]/page.tsx` | 개별 주소. 메타데이터만 그 논문 것으로 바꾼다. 없는 slug면 목록으로 리다이렉트한다 |
| `src/app/publications/_lib/publicationPage.tsx` | 개별 주소의 카드 내용(제목, 설명)을 만든다 |
| `src/lib/publicationSlug.ts` | 개별 주소를 만들고, 주소에서 항목 id를 꺼낸다 |

특허(`src/app/publications/patents/`)도 같은 구성이다.

- slug는 목록의 DOM id와 같은 값이다.
- `PaperList`, `PatentList`가 주소의 slug를 읽어 그 항목으로 스크롤하고 강조한다. 필요하면 숨겨진 구역이나 필터도 맞춰 연다.
- 링크 복사 버튼과 뉴스·홈·프로필 상세의 논문·특허 링크가 모두 이 주소를 쓴다. `#` 링크는 더 이상 처리하지 않는다.

### 6-3) 세 가지 방식 비교

`#` 방식에 비해 개별 주소가 얻는 것은 "논문마다 다른 공유 카드" 하나이고, 나머지 항목은 비용이다.

| 항목 | `#` 방식 (이전) | 개별 주소, 정적 | 개별 주소, 동적 (현재) |
| --- | --- | --- | --- |
| 공유 카드 | 어느 논문이든 `Papers \| GLI Lab` | 논문별 제목·학회·저자 | 논문별 제목·학회·저자 |
| 브라우저 탭 제목 | `Papers \| GLI Lab` | 논문 제목 | 논문 제목 |
| 해당 논문으로 스크롤·강조 | 됨 | 됨 | 됨 |
| 서버가 하는 일 | 없음. 목록 페이지 하나를 그대로 보냄 | 없음. 미리 만든 파일을 보냄 | 요청마다 목록에 그 논문의 태그를 붙여 만듦 |
| 빌드 결과물 | 목록 페이지 1개 | 복사본 66개, 약 16MB 추가 | 추가 없음 |
| Vercel 함수 한도 | 쓰지 않음 | 쓰지 않음 | 방문 1회당 1번 |
| 응답 속도 | 빠름 | 빠름 | 조금 느림 |
| 검색엔진 | 주소가 하나라 중복 없음 | 66개 주소를 canonical로 목록에 묶음 | 66개 주소를 canonical로 목록에 묶음 |
| 제목이 바뀌어 옛 링크가 됐을 때 | 목록 맨 위가 열림 | 목록으로 리다이렉트 | 목록으로 리다이렉트 |
| 코드 | 가장 단순. 라우트 파일 추가 없음 | 라우트 파일과 주소 변환 코드 추가 | 라우트 파일과 주소 변환 코드 추가 |
| 확인 안 된 위험 | 없음 | Vercel 변환 단계의 긴 한글 파일 이름 (6-5) | 없음 |

수치는 2026년 11월 기준이다 (논문 52건, 특허 14건).

### 6-4) 동적 렌더링을 고른 이유

`[slug]/page.tsx`에 `export const dynamic = 'force-dynamic'`을 둔 이유다.

- **정적으로 하면 같은 내용의 복사본이 생긴다.** 본문이 목록과 같으므로, 미리 만들면 `<head>` 몇 줄만 다른 파일이 항목 수만큼 생긴다. 논문은 한 벌에 약 273KB씩 52개, 특허는 약 136KB씩 14개로 합쳐서 약 16MB다. 개별 주소를 뺀 전체 빌드 결과가 6.3MB다.
- **개별 주소는 드물게 열린다.** 공유된 링크나 사이트 안의 논문 링크를 눌렀을 때만 열린다. 동적 방식은 열릴 때만 Vercel 함수가 한 번 실행되므로 비용이 방문 수에 비례한다.
- **목록 주소는 정적으로 남는다.** 목록 주소는 `page.tsx`가 따로 받아서 `force-dynamic`의 영향을 받지 않고, 지금처럼 미리 만들어 두고 1시간마다 갱신한다. 프로필·갤러리처럼 `[[...slug]]/page.tsx` 하나로 합치면 목록 주소까지 동적이 되므로 합치지 않았다.

개별 주소 방문이 크게 늘어 Vercel 함수 한도가 부담되면 정적 전환을 다시 검토한다. Hobby 플랜의 한도는 2026년 11월 Vercel 문서 기준으로 함수 호출 월 100만 건, 함수 CPU 사용 월 4시간이다.

### 6-5) 정적으로 바꿀 때 확인할 것

한글 제목의 slug가 파일 이름 길이 제한(보통 255바이트)에 걸리는지가 문제다. 가장 긴 slug는 44자인데, 주소 형태로 인코딩하면 308자가 된다.

2026년 11월 18일에 Next.js 16.4.5로 시험한 결과는 다음과 같다. 이 프로젝트 밖의 테스트 앱에서 가장 긴 slug를 `generateStaticParams`로 넘겨 빌드했다.

| 시험 | 결과 |
| --- | --- |
| 빌드 (Turbopack, webpack 둘 다) | 성공 |
| 만들어진 파일 이름 | 인코딩하지 않고 한글 그대로. 가장 긴 것이 119바이트 |
| 빌드한 서버에서 그 주소 요청 | 200. 미리 만든 파일에서 응답 |
| 일부러 만든 한글 90자(270바이트) slug 요청 | 페이지는 200으로 열림. 캐시 파일 저장만 `ENAMETOOLONG`으로 실패 |

- 로컬 빌드 기준으로는 한글 약 80자(246바이트)까지 제한 안에 들어온다.
- **Vercel 쪽은 확인하지 못했다.** Vercel은 빌드 결과물을 자기 배포 형식으로 한 번 더 바꾸는데, 그 단계에서 긴 한글 이름이 어떻게 되는지는 시험할 수 없었다. 정적으로 바꿀 때는 운영에 반영하기 전에 미리보기 배포에서 한글 제목 주소를 먼저 열어 본다.

## 7) canonical

canonical(`<link rel="canonical">`)은 같은 내용이 여러 주소로 열릴 때 검색엔진에 대표 주소를 알려 주는 태그다. 검색엔진은 같은 canonical을 가리키는 주소들을 한 페이지로 묶어 본다. 강제 규칙이 아니라 힌트여서 최종 판단은 검색엔진이 한다.

공유 카드는 canonical이 아니라 `og:url`을 쓴다. 그래서 canonical을 어떻게 두든 카드 내용은 달라지지 않는다.

종류마다 canonical이 다른 이유는 그 주소에서만 볼 수 있는 내용이 있느냐의 차이다.

| 종류 | 그 항목만의 내용 | canonical | `og:url` |
| --- | --- | --- | --- |
| 프로필 | 서버가 보내는 페이지에 그 사람의 상세가 들어 있음 | 자기 주소 | 자기 주소 |
| 갤러리 앨범 | `?detail=1`이 붙으면 브라우저가 그 앨범을 모달로 보여 줌 | 자기 주소 | 자기 주소 |
| 논문·특허 | 없음. 스크롤 위치만 다름 | 목록 주소 | 자기 주소 |

- **`?detail=1`, `?cols=1`은 canonical에서 빠진다.** `…/<slug>/`와 `…/<slug>/?detail=1`은 같은 항목이므로 같은 canonical로 묶인다.
- **프로필의 `?view=list`는 canonical에 남는다.** 목록형 보기 주소는 `…/<slug>/?view=list`가 그대로 대표 주소가 된다.
- **논문·특허만 목록 주소를 가리킨다.** 개별 주소의 본문이 목록 주소와 글자 하나 다르지 않아서 검색엔진에는 목록의 복사본이다. `getMetadata`의 `canonicalPath`로 지정한다.

## 8) 알아둘 제약

- **slug의 바탕이 되는 값을 바꾸면 주소도 바뀐다.** 논문·특허는 제목, 프로필은 합류 연월과 영문 이름, 앨범은 날짜다. 옛 주소는 목록으로 리다이렉트된다. In Progress 논문의 임시 제목을 확정 제목으로 바꿀 때도 해당한다.
- **In Progress, Under Review 논문도 개별 주소가 있다.** 그 주소를 공유하면 카드에 제목과 저자가 나온다.
- **프로젝트는 여전히 `#` 방식이다.** `/research/projects#<id>`로 이동하며, 프로젝트별 공유 카드는 없다.
- **공유 카드는 서비스마다 따로 캐시된다.** 카드 내용을 바꾼 뒤에도 이미 공유된 적 있는 주소는 한동안 예전 카드가 보인다. 카카오톡은 카카오 디벨로퍼스의 [도구] > [초기화 도구] > [OG 캐시]에서 지울 수 있다. 캐시는 `?` 뒤까지 포함한 주소 전체를 기준으로 잡히므로, 공유했던 형태 그대로(예: `…/<slug>/?detail=1`) 넣어야 한다.

## 9) 페이지별 공유 카드 실제 결과

2026년 11월 18일에 개발 서버에서 카카오톡 크롤러 이름으로 요청해 받은 값이다. 문구의 원본은 각 `page.tsx`, `layout.tsx`와 3)의 표에 적힌 파일들이다. 그쪽을 고치면 이 표도 함께 고친다.

### 9-1) 목록 페이지

이미지는 갤러리만 가장 최근 앨범의 첫 사진이고, 나머지는 모두 사이트 기본 로고(`/images/logo/GLI_opengraph_2000x1050.jpg`)다.

| 주소 | 제목 | 설명 |
| --- | --- | --- |
| `/` | Home \| GLI Lab | 그래프와 텍스트 기반의 인공지능 기술을 연구개발하고 새로운 응용방법(언어모델·그래프 융합, 그래프 예측·분석, 자연어처리, 추천시스템, 이상탐지 등)을 찾아내는 것을 목적으로 합니다. |
| `/research/topics/` | Vision and Topics \| GLI Lab | Research vision and areas from GLI Lab - Knowledge-driven AI, Neuro-Symbolic AI, and Graph-Language fusion for the future of AGI |
| `/research/projects/` | Projects \| GLI Lab | Ongoing and completed research projects of the Graph & Language Intelligence Lab at Konkuk University |
| `/publications/papers/` | Papers \| GLI Lab | Conference and journal papers from the Graph & Language Intelligence Lab at Konkuk University |
| `/publications/patents/` | Patents \| GLI Lab | Registered and filed patents from the Graph & Language Intelligence Lab at Konkuk University |
| `/board/news/` | News \| GLI Lab | Publication, funding, and member news from the Graph & Language Intelligence Lab at Konkuk University |
| `/board/seminar/` | Seminar \| GLI Lab | Seminar presentations and slides from the Graph & Language Intelligence Lab at Konkuk University |
| `/board/study/` | Study \| GLI Lab | Paper reading and study groups from the Graph & Language Intelligence Lab at Konkuk University |
| `/board/lectures/` | Lectures \| GLI Lab | Courses taught each semester by the Graph & Language Intelligence Lab at Konkuk University |
| `/board/resources/` | Resources \| GLI Lab | Conference rankings, deadlines, and journal evaluation resources from GLI Lab |
| `/board/gallery/` | Gallery \| GLI Lab | Photo albums of the Graph & Language Intelligence Lab at Konkuk University |
| `/people/professor/` | Professor \| GLI Lab | Professor of the Graph & Language Intelligence Lab at Konkuk University |
| `/people/members/` | Members \| GLI Lab | Faculty, graduate students, and undergraduate interns of the Graph & Language Intelligence Lab at Konkuk University |
| `/people/alumni/` | Alumni \| GLI Lab | Alumni of the Graph & Language Intelligence Lab at Konkuk University |
| `/contact/information/` | Email & Location \| GLI Lab | Email and location of the Graph & Language Intelligence Lab at Konkuk University |
| `/contact/hiring/` | ✨ Now Hiring (Q&A) ✨ \| GLI Lab | Openings for graduate students (MS/PhD) and undergraduate research interns at the Graph & Language Intelligence Lab, Konkuk University |

- 홈(`/`)만 페이지별 설명 없이 사이트 기본 설명(`src/lib/GetMetadata.tsx`의 `META.description`)을 쓴다.

### 9-2) 개별 항목

종류마다 대표적인 경우를 하나씩 골랐다.

| 종류 | 제목 | 설명 | 이미지 |
| --- | --- | --- | --- |
| 교수 프로필 | Byungkook Oh (오병국) | Assistant Professor (조교수) | 프로필 카드 이미지 |
| 재학생 프로필 | Jimyeung Seo (서지명) | M.S. Student (4학기) \| Joined 2024.06 | 프로필 카드 이미지 |
| 졸업생 프로필 | Youngho Lee (이영호) | Undergraduate Student \| 2024.06 - 2026.04 | 프로필 카드 이미지 |
| 앨범 | 가득 찬 학생연구실을 보며 | 2026-08-28 \| 처음 12층 연구실을 배정받고 혼자 밀대로 바닥을 닦아가며 정리하던 때가 엊그제 같은데, 이렇게 자리가 다 찬 연구실을 보니 기분이 묘합니다. | 앨범의 첫 사진 |
| 앨범 (첫 문장이 120자를 넘음) | CIKM'26 최우수학술대회 발표 (로마, 이탈리아) | 2026-11-07 ~ 2026-11-11 \| 우리 연구실은 CIKM 2026(ACM International Conference on Information and Knowledge Management)에 참석하여 최신 정보검색·데이터마이닝·지식관리 분야의… | 앨범의 첫 사진 |
| 학회 논문 | Continuation-Conditioned Relational Routing for Early Fake News Detection | WSDM 2027 \| Jimyeung Seo, Dayeon Hong, Dongcheon Lee, Bonyou Koo, Donghyun Kim, Byungkook Oh | 사이트 기본 로고 |
| 국내 논문 | 그래프 패턴 머신 기반 서브구조 복원을 이용한 그래프 노드 이상 탐지 | KCC 2026 \| Donghyun Lee, Hae-Yoon Koo, Byungkook Oh | 사이트 기본 로고 |
| 심사 중 논문 | Query-Conditioned Semantic Rewiring for Knowledge Graph Foundation Models | Under Review \| Donghyun Lee, Sang-Hyun Park, Dongcheon Lee, Seyeong Kim, Donghyun Kim, Byungkook Oh | 사이트 기본 로고 |
| 등록 특허 | 개체 간 관계 추출 방법 및 장치 | 등록 10-2382914 (2022-03-31) \| 신동훈, 이연수, 이경호, 이상학, 서승민, 오병국 | 사이트 기본 로고 |
| 출원 특허 | 텍스트 풍부도 및 일관성에 기반한 아이템 식별자 생성 방법 및 장치 | 출원 10-2026-0177146 (2026-09-16) \| 구해윤, 최진호, 오병국 | 사이트 기본 로고 |

- 프로필은 합류 시기가 비어 있으면 과정만 나온다. 교수 프로필이 그렇다.
- 프로필의 학기 정보는 학기마다 YAML이 바뀌면 따라 바뀐다.
- 25개 앨범 중 첫 문장이 잘리는 것은 국제학회 앨범 5개다.

### 9-3) 주소 태그

| 종류 | `og:url` | canonical |
| --- | --- | --- |
| 목록 페이지 | 자기 주소 | 자기 주소 |
| 프로필, 앨범 | 자기 주소 | 자기 주소 |
| 논문, 특허 | 자기 주소 | 목록 주소 (`/publications/papers/`, `/publications/patents/`) |

### 9-4) 다시 확인하는 방법

개발 서버(`pnpm dev`)를 띄운 뒤 확인할 주소를 요청해 태그만 뽑아 본다. 크롤러 이름(`-A`)을 붙여야 태그가 `<head>`에 들어간 상태로 온다.

```bash
$ curl -s -A "facebookexternalhit/1.1;kakaotalk-scrap/1.0" http://localhost:3000/board/news/ \
    | grep -oE '<(meta property="og:(title|description|image|url)"|link rel="canonical")[^>]*>'
```

값에는 `https://gli.konkuk.ac.kr`이 붙어 나온다. 개발 서버에서도 운영 주소 기준으로 만들어지기 때문이다.
