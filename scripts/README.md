# Scripts

## 이미지 최적화 스크립트

### 개요

이 스크립트는 갤러리 이미지와 프로필 이미지를 WebP 포맷으로 최적화하여 웹사이트 성능을 향상시킵니다.

### 기능

#### 1. 갤러리 이미지 최적화
- `public/images/gallery/` 폴더의 모든 이미지를 WebP로 변환
- 레티나 디스플레이 지원 (최대 1800px)
- 100% 품질로 최적화

#### 2. 프로필 이미지 최적화
- `public/images/profiles/` 폴더의 JPG/PNG를 WebP로 변환
- 원본 해상도 유지 (리사이즈 없음)
- 95% 품질로 최적화

### 사용법

```bash
# 갤러리 + 프로필 이미지 모두 최적화
node scripts/optimize-gallery.js
```

### 처리 과정

1. **갤러리 이미지**: JPG/PNG → WebP (최대 1800px, 100% 품질)
2. **프로필 이미지**: JPG/PNG → WebP (원본 크기, 95% 품질)
3. **원본 파일 자동 삭제**
4. **용량 절약 통계 표시**

---

## OpenGraph 이미지 생성 스크립트

### 개요

이 스크립트는 Next.js 빌드 전에 모든 프로필의 OpenGraph 이미지를 미리 생성하여 성능을 향상시킵니다.

### 사용법

#### 1. 수동 실행
```bash
# 기본 실행 (기존 파일 스킵)
node scripts/generate-og-images.js

# 강제 재생성 (모든 파일 덮어쓰기)
node scripts/generate-og-images.js --force
```

#### 2. 빌드 전 자동 실행
```bash
npm run build
```

`package.json`의 `prebuild` 스크립트가 빌드 전에 자동으로 실행됩니다.

> **⚠️ 주의사항**: `prebuild`를 사용하면 빌드 시간이 길어집니다. 
> 프로덕션 환경에서는 서버에서 스크립트를 실행하고 GitHub에 결과물을 올리는 것을 권장합니다.

### 실행 모드

#### 🔄 증분 모드 (기본값)
- 기존 파일이 있으면 스킵
- 새로운 프로필이나 누락된 파일만 생성
- 빠른 빌드 시간

#### 🔁 강제 재생성 모드 (`--force`)
- 모든 파일을 새로 생성
- 프로필 정보가 변경되었을 때 사용
- 완전한 재생성 보장

---

## 전체 워크플로우

### 새로운 이미지 추가 시 권장 순서

#### 🚀 개발 환경 (빠른 테스트용)
```bash
# 1. 이미지 최적화 (갤러리 + 프로필 → WebP)
node scripts/optimize-gallery.js

# 2. OpenGraph 이미지 생성 (프로필 → OG WebP)
node scripts/generate-og-images.js

# 3. 빌드 (prebuild 스크립트가 자동으로 OG 이미지 재생성)
npm run build
```

#### 🏭 프로덕션 환경 (권장)
```bash
# 1. 서버에서 이미지 최적화 및 OG 생성
node scripts/optimize-gallery.js
node scripts/generate-og-images.js

# 2. 생성된 파일들을 GitHub에 커밋
git add public/images/
git commit -m "Update optimized images and OpenGraph images"
git push

# 3. 빌드 (이미지 생성 과정 생략되어 빠름)
npm run build
```

### 스크립트 통합 실행

#### 🔄 prebuild 자동 실행
```bash
# prebuild에서 두 스크립트 모두 실행됨
npm run prebuild
# 실행 순서: generate-og-images.js → optimize-gallery.js
```

#### ⚡ 수동 실행 (빌드 시간 단축)
```bash
# 1. 이미지 최적화 및 OG 생성
node scripts/optimize-gallery.js
node scripts/generate-og-images.js

# 2. 생성된 파일들을 Git에 추가
git add public/images/

# 3. 빠른 빌드 (이미지 생성 과정 생략)
npm run build
```

> **💡 팁**: CI/CD 파이프라인에서는 prebuild를 비활성화하고, 
> 이미지 생성은 별도 단계에서 실행하는 것이 효율적입니다.

### 파일 포맷 정리

| 이미지 타입 | 원본 포맷 | 최적화 포맷 | 용도 |
|------------|-----------|-------------|------|
| 갤러리 이미지 | JPG/PNG | WebP | 웹사이트 갤러리 표시 |
| 프로필 이미지 | JPG/PNG | WebP | 프로필 페이지 표시 |
| OpenGraph 이미지 | - | WebP | 소셜 미디어 미리보기 |
| 로고 이미지 | JPG | JPG | OpenGraph 백업용 |

