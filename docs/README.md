
# GLI-Lab 문서

이 폴더에는 GLI-Lab 프로젝트와 관련된 다양한 문서들이 포함되어 있습니다.

## 문서 목록

- [PM2 사용법 가이드](./pm2-usage.md) - PM2 프로세스 매니저 사용법 및 서버 관리 가이드

## 개발관련 지식

### Dependencies vs DevDependencies

- dependencies    : 런타임에 필요한 실제 라이브러리
- devDependencies : 개발 시점에만 필요한 타입선언 패키지

```bash
yarn add js-yaml
yarn add -D @types/js-yaml
```