# `src/data/generated`

## 한 줄 요약

- `public/`에 파일은 그대로 두고, **“어떤 파일이 있는지” 목록만** 미리 JSON으로 적어 둔다.
- 런타임에는 `public/`을 `readdir`하지 않고 이 JSON만 읽는다.

## 왜 필요한가

- 서버 코드가 `public/pdf` 등을 `readdir`하면, Next.js/Vercel 트레이싱이 PDF·이미지 원본까지 함수 번들에 넣을 수 있음
- → 서버리스 용량 제한(약 250MB)을 넘기기 쉬움
- 인덱스는 **파일명(경로) 목록만** 담음. 원본은 `public/`에 두고 정적 URL로만 제공

## `public-file-index.json`

- 생성: `node scripts/generate-public-file-index.js` (`npm run prebuild`에 포함)
- 형태: **flat** — `{ "폴더": ["파일명", ...] }`
- 현재 포함 (한 폴더 안 파일만 나열하면 되는 것들)
  - `pdf/seminar` — 세미나 슬라이드 (`seminarLoader`)
  - `pdf/cv` — 프로필 CV (`profileLoader`)
  - `images/profiles` — 프로필 사진 (`profileLoader`)
- 위 파일을 추가·이름 변경한 뒤에는 인덱스를 다시 생성해야 반영됨

## 포스터(`public/pdf/poster`)는?

- **이 JSON에 넣지 않음**
- 경로가 `paper.yaml`에 이미 적혀 있음 (`Poster: /pdf/poster/...`)
- CV·세미나처럼 “폴더를 훑어 파일을 찾는” 로직이 없어서 인덱스가 필요 없음
- 파일은 `public/pdf/poster`에 두고, YAML 경로만 맞추면 됨

## 갤러리(`public/images/gallery`)는?

- **이미지를 `public/`에 두면 안 된다는 뜻이 아님** — 두는 위치는 맞음
- 다만 갤러리 구조는 flat이 아님
  - `images/gallery / 폴더명 / 이미지들 + config.yaml`
- 그래서 지금 이 flat JSON에는 **넣지 않음**
- 목록은 아직 `Gallery/utils.ts`가 `public/images/gallery`를 직접 `readdir`
- 같은 방식으로 바꾸려면 **tree(폴더 → 이미지·메타)** 인덱스가 필요함
  - 예: `{ "260212": { "images": ["1.webp", ...], "config": ... }, ... }`
- 핵심은 flat vs tree가 아니라, **런타임에 `public`을 `readdir`하지 않게** 목록을 미리 적어 두는 것
