## 목차

- [1) YAML과 로더](#1-yaml과-로더)
- [2) unstable_cache 적용 대상과 사용 이유](#2-unstable_cache-적용-대상과-사용-이유)
- [3) 정적 페이지에서의 동작](#3-정적-페이지에서의-동작)
- [4) 동적 페이지에서의 동작](#4-동적-페이지에서의-동작)
- [5) 이 사이트에서 실제 역할](#5-이-사이트에서-실제-역할)

## 1) YAML과 로더

`src/data/*.yaml`(프로필은 `src/data/profiles/`)을 페이지가 직접 읽지 않는다. `src/data/loaders/`가 파일을 읽어 가공하고, 서버 컴포넌트가 그 결과로 HTML을 그린다. 클라이언트에 YAML이나 로더 결과가 API로 넘어가지는 않는다.

내용이 바뀌는 시점은 **git에 넣고 `next build`한 뒤 배포**할 때뿐이다. 서버에 YAML만 고쳐도 정적 HTML은 그대로다.

갤러리는 YAML 로더를 쓰지 않는다. `src/components/Gallery/utils.ts`의 `getGalleryItems()`가 `public/images/gallery`를 `readdirSync`한다. 사진도 `public/`에 커밋하고 재배포해야 반영된다.

## 2) unstable_cache 적용 대상과 사용 이유

적용 위치는 `src/data/loaders/index.ts`의 `createCachedLoader`다. 다음 export가 감싸져 있다.

| export | YAML |
| --- | --- |
| `getNews` | `news.yaml` |
| `getSeminars` | `seminar.yaml` |
| `getStudies` | `study.yaml` |
| `getPapers` | `paper.yaml` |
| `getPatents` | `patent.yaml` |
| `getProjects` | `project.yaml` |
| `getProfiles` / `getAlumniProfiles` | `profiles/*.yaml` |

`getProfileLinks()`는 위 프로필 로더를 호출하므로 캐시를 그대로 쓴다. `getGalleryItems()`는 여기에 없다.

의도한 이유: 서버에서 YAML을 파싱·가공한 결과를 저장해 두고, **같은 함수가 다시 호출돼도 1시간(`revalidate: 3600`) 안이면 재파싱하지 않는다.** 캐시 키에 `DEPLOY_CACHE_BUST`를 넣어 배포가 바뀌면 칸을 가른다. `next dev`에서는 캐시를 건너뛰어 YAML 수정이 즉시 보인다.

`unstable_cache` 자체는 HTML 캐시가 아니다. 로더가 다시 불렸을 때, 1시간이 지났으면 그때 YAML을 다시 읽는다. 다만 `revalidate: 3600`은 이 로더를 쓰는 정적 페이지의 ISR 주기로 **따라 올라간다.** 페이지에 `export const revalidate`는 없다. 그 결과는 3)에서 다룬다.

## 3) 정적 페이지에서의 동작

**원래 정적 페이지는 이미 만들어 둔 HTML을 다음 배포까지 무한정 재사용한다.** YAML 로더의 `unstable_cache`에 `revalidate: 3600`을 두면 Next가 그 값을 페이지 ISR로 올려, **1시간이 지난 뒤 다음 요청에서 HTML을 다시 그릴 수 있게** 된다. 1시간마다 타이머가 돌아가며 재생성하는 것은 아니다.

**그래서 정적 페이지는 `unstable_cache` 혜택을 사실상 보지 못한다.** 방문마다 YAML을 다시 안 읽는 이유는 캐시가 아니라 빌드된 HTML 때문이고, 3600이 하는 일은 그 무제한 재사용을 1시간으로 끊을 수 있게 만드는 것이다.

확인: `npx next build` 표의 `○ (Static)`. 페이지에 `export const revalidate`는 없고, `Revalidate 1h`는 로더의 3600이 올라온 결과다.

| 경로 | 로더 | Revalidate |
| --- | --- | --- |
| `/` | `getNews`, `getSeminars`, `getProfileLinks`, `getGalleryItems` | 1h |
| `/board/news` | `getNews`, `getProfileLinks` | 1h |
| `/board/seminar` | `getSeminars`, `getProfileLinks` | 1h |
| `/board/study` | `getStudies`, `getProfileLinks` | 1h |
| `/publications/papers` | `getPapers`, `getProfileLinks` | 1h |
| `/publications/patents` | `getPatents`, `getProfileLinks` | 1h |
| `/research/projects` | `getProjects`, `getProfileLinks` | 1h |
| `/board/lectures` | 없음 | 없음 (다음 배포까지) |
| `/board/resources` | 없음 | 없음 (다음 배포까지) |
| `/contact/hiring` | 없음 | 없음 (다음 배포까지) |
| `/contact/information` | 없음 | 없음 (다음 배포까지) |
| `/people/professor` | 없음 | 없음 (다음 배포까지) |
| `/publications` | 없음 | 없음 (다음 배포까지) |
| `/research/topics` | 없음 | 없음 (다음 배포까지) |

빌드 때 로더가 YAML을 읽고 HTML을 `.html`로 써 둔다. 이후 방문은 그 HTML을 준다. 캐시가 없어도 `/board/news`를 열 때마다 `news.yaml`을 다시 읽지 않는다.

남아 있는 동작 두 가지는 혜택이라고 보기 어렵다.

- 빌드 중 여러 페이지가 같은 `getNews()` 등을 호출할 때 파싱을 한 번으로 줄인다. YAML이 작아 체감이 없다.
- 위 ISR. 디스크의 YAML이 같으면 다시 그려도 결과도 같다. **같은 HTML을 다시 그릴 수 있는 부작용에 가깝다.**

표에서 Revalidate가 없는 행은 로더를 안 쓰므로 1시간이 없다. 다음 배포까지 HTML을 그대로 준다.

새 배포는 `next build`가 HTML을 다시 만들므로 이전 1시간을 기다리지 않는다. 타이머는 이번 빌드부터 다시 센다.

## 4) 동적 페이지에서의 동작

확인: 페이지에 `export const dynamic = 'force-dynamic'`이 있고, 빌드 산물에 `.html`이 없다. 방문마다 서버가 페이지를 다시 그린다.

| 경로                | 데이터                               | `unstable_cache`        |
| ----------------- | --------------------------------- | ----------------------- |
| `/people/members` | `getProfiles`                     | 사용. 1시간 동안 YAML 재파싱 안 함 |
| `/people/alumni`  | `getAlumniProfiles`               | 사용. 1시간 동안 YAML 재파싱 안 함 |
| `/board/gallery`  | `getGalleryItems` (`readdirSync`) | 없음. 요청마다 폴더를 읽음         |

요청 단위로 캐시가 의미 있는 곳은 멤버·alumni뿐이다. 갤러리 주석 `즉각 업데이트 가능`은 폴더만 넣으면 바로 보인다는 가정이었고, 실제로는 재배포해야 한다.

`?view=list` 같은 쿼리는 콘텐츠가 아니라 UI 상태다. 클라이언트(`ProfileCards`, `GalleryGrid`)가 `useSearchParams`로 읽는다.

## 5) 이 사이트에서 실제 역할

YAML·갤러리·프로필 사진 모두 배포 단위로만 바뀐다. 그 전제면 정적 페이지의 방문 비용을 줄이기 위해 로더에 `unstable_cache`를 둘 필요는 거의 없다. 있어도 큰 문제는 아니지만, 홈·뉴스 등에 1시간 ISR이 붙는 부작용이 있다.

멤버·갤러리까지 뉴스처럼 정적으로 만들면 요청 단위 역할도 없어진다. 새 내용은 다음 `next build`에서 반영된다.
