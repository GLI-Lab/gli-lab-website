## 목차

- [1) 이 폴더가 하는 일](#1-이-폴더가-하는-일)
- [2) 실행 순서](#2-실행-순서)
- [3) normalize-public-filenames.js](#3-normalize-public-filenamesjs)
- [4) optimize-images.js](#4-optimize-imagesjs)
- [5) generate-og-images.js](#5-generate-og-imagesjs)
- [6) generate-public-file-index.js](#6-generate-public-file-indexjs)
- [7) 사진 추가·삭제 후](#7-사진-추가삭제-후)

## 1) 이 폴더가 하는 일

`public/`에 넣은 원본(한글 파일명, JPG/PNG, 큰 사진)을 사이트가 쓸 수 있는 형태로 바꾼다. 네 스크립트는 `package.json`의 `prebuild`가 아래 순서로 실행한다.

```
normalize-public-filenames.js
  → optimize-images.js
  → generate-og-images.js
  → generate-public-file-index.js
```

화면 표시용 리사이즈·재압축은 이 스크립트가 아니라 `next/image`가 요청 시점에 한다 (`w=640`, `q=75` 등). 여기 스크립트는 **git에 올릴 원천 파일**을 웹용 크기로 맞춰 두는 단계다.

## 2) 실행 순서

```bash
$ pnpm prebuild
# 또는 하나만
$ node scripts/optimize-images.js
$ node scripts/generate-og-images.js          # 없는 OG만 생성
$ node scripts/generate-og-images.js --force  # 전부 다시 생성
```

할 일이 없으면 각 스크립트는 건너뛰므로 반복 실행 비용은 작다. 새 멤버 사진을 넣은 뒤에는 `prebuild`를 돌리고 생성된 WebP·OG를 함께 커밋한다.

## 3) normalize-public-filenames.js

**목적:** `public/` 한글 파일명을 NFC(완성형)로 맞춘다.

macOS는 한글을 NFD(조합형)로 저장한다. 리눅스 서버에서는 같은 글자가 다른 파일명이 되어, 프로필 사진 정렬(`1`, `2`, `3`)이 깨질 수 있다. `public/pdf/seminar`, `public/pdf/cv`, `public/images/profiles`를 훑어 NFC가 아닌 이름만 바꾼다.

## 4) optimize-images.js

**목적:** 갤러리·프로필 사진을 WebP로 바꾸고, 긴 변이 한도를 넘으면 줄인다. JPG/PNG 원본은 변환 후 삭제한다.

한도는 **가로·세로 중 긴 변**이다. `fit: inside`로 그 상자에 비율을 유지한 채 넣는다. 세로 사진이면 세로가 한도, 가로는 더 짧다.

| | 긴 변 한도 | 품질 | 대상 |
|---|---|---|---|
| 갤러리 `public/images/gallery/<폴더>/` | 2048px | WebP q82 | JPG/PNG 변환. 이미 WebP이고 2048 이하면 스킵 |
| 프로필 `public/images/profiles/`, `.../alumni`, `public/images/etc` | 1600px | WebP q82 | JPG/PNG 변환. **이미 WebP여도 1600을 넘으면 리사이즈** |

한도 이유: 지금 화면(갤러리 모달 1024 CSS px, 프로필 상세 `sizes` 640px)보다 여유를 두어 레이아웃이 한 단계 커져도 레티나를 맞춘다. 갤러리 2048 = 모달 1024×2. 프로필 1600 = 상세보다 크고, 나중에 큰 모달을 켜도 버틴다. q82인 이유: 웹에서 눈으로 무손실에 가까운 구간이고, 페이지는 어차피 `next/image`가 q=75로 다시 보낸다.

이미 WebP이고 한도 이하면 건너뛴다. 갤러리 기존 WebP를 q82로 다시 누르지는 않는다.

```bash
$ node scripts/optimize-images.js
```

## 5) generate-og-images.js

**목적:** 프로필 공유용 Open Graph 이미지(1200×630 WebP)를 `public/images/profiles-og/`에 미리 만든다.

최신 `profiles.yaml` / `profiles-alumni.yaml`을 읽고, 사진·이름·역할을 합성한다. 최신 학기 파일은 `src/data/loaders/profileYamlFile.js`를 쓰며, 사이트 로더(`profileLoader.ts`)와 같다. 결과는 git에 커밋한다. 서버의 한글 폰트에 의존하지 않도록 빌드 산출물이 아니라 저장소에 둔다.

- 기본: 파일이 있으면 스킵 (새 프로필만 생성)
- `--force`: 전부 다시 생성. 기존 사진을 리사이즈했거나 이름/역할을 바꿨을 때

```bash
$ node scripts/generate-og-images.js
$ node scripts/generate-og-images.js --force
```

## 6) generate-public-file-index.js

**목적:** `public/`을 런타임에 `readdir`하지 않도록, 파일명 목록과 프로필 사진 내용 해시(SHA-256 앞 8자)를 `src/data/generated/public-file-index.json`에 적는다.

로더가 이 JSON만 읽는다. 해시는 같은 파일명으로 사진을 갈아끼워도 `?v=`가 바뀌어 1년 캐시를 피하게 한다. 인덱스가 가리키는 폴더: `pdf/seminar`, `pdf/cv`, `images/profiles`. 갤러리·포스터는 YAML/폴더 구조가 달라 넣지 않는다.

`prebuild` 마지막에 실행된다. 사진을 지웠는데 인덱스를 안 돌리면 개발 서버(`next dev`는 prebuild를 안 탐)가 없는 파일을 가리킬 수 있다.

## 7) 사진 추가·삭제 후

1. 파일을 `public/images/profiles/` 또는 `public/images/gallery/<폴더>/`에 넣거나 지운다.
2. `pnpm prebuild` (또는 위 스크립트를 순서대로).
3. 프로필 사진을 바꿨으면 OG가 스킵될 수 있으니 `node scripts/generate-og-images.js --force`를 한 번 더 돌린다.
4. 생성된 WebP·OG·인덱스 JSON을 커밋한다.
