## 목차

- [1) Node.js / npm 런타임](#1-nodejs--npm-런타임)
- [2) 전역 도구 (pnpm, pm2)](#2-전역-도구-pnpm-pm2)
- [3) 특정 패키지 업데이트](#3-특정-패키지-업데이트)
- [4) 전체 패키지 최신화 (주의)](#4-전체-패키지-최신화-주의)
- [5) 일부 패키지 최신화 (주의)](#5-일부-패키지-최신화-주의)
- [6) 추천하는 방식](#6-추천하는-방식)

## 1) Node.js / npm 런타임

Node.js / npm 런타임 설치와 업데이트는 [nvm 사용법](./nvm-usage.md)을 본다.

## 2) 전역 도구 (pnpm, pm2)

`pnpm`과 `pm2`는 `npm install -g`로 설치한 도구라 이 프로젝트의 `package.json`에 없다. 버전 확인은 설치하지 않는다.

```bash
$ npm ls -g --depth=0 pnpm pm2  # 현재 Node에 전역 설치된 pnpm, pm2 버전. 없으면 empty
$ npm view pnpm version         # 레지스트리에 올라온 pnpm 최신 버전. 설치하지 않음
$ npm view pm2 version          # 레지스트리에 올라온 pm2 최신 버전. 설치하지 않음
```

최신으로 올릴 때는 설치 명령과 같다. NVM을 쓰면 지금 활성화된 Node 버전에만 설치된다.

```bash
$ npm install -g pnpm@latest
$ npm install -g pm2@latest
$ pm2 update
```

`pm2 update`는 이미 떠 있는 PM2 데몬을 방금 설치한 버전으로 다시 올린다. 사용법은 [pnpm 사용법](./pnpm-usage.md), [PM2 사용법](./pm2-usage.md)을 본다.

## 3) 특정 패키지 업데이트

```bash
$ pnpm add next@latest
```

- Next 버전만 최신으로 변경하고 나머지는 그대로 둠
- react, react-dom, tailwind, @vercel/analytics 등은 자동으로 최신으로 안 올라감
- 단, Next가 요구하는 peer dependency가 안 맞으면 경고가 뜰 수 있음 (이 경우 React 등을 따로 맞춰야 함)

## 4) 전체 패키지 최신화 (주의)

```bash
$ npx npm-check-updates -u
$ pnpm install
```

- 전체 패키지를 latest로 바꿔버림
- 패키지들 사이의 “최적 조합”은 고려하지 않기 때문에, 디버깅 난이도 급상승함
- 설치 단계에서 pnpm이 호환성 검사는 함 (충돌 시 경고/에러)

## 5) 일부 패키지 최신화 (주의)

```bash
$ npx npm-check-updates -u next react react-dom
$ pnpm install

$ pnpm add next@latest react@latest react-dom@latest
```

- 지정한 3개 패키지를 각각 latest로 올림
- 서로의 “궁합을 계산해서 가장 안전한 조합”을 찾아주지는 않음
- 설치 시 pnpm이 peer dependency 조건을 검사만 함

## 6) 추천하는 방식

1. next 업데이트

2. 필요 시 react, react-dom 버전 맞추기

3. 그 다음에 tailwind / eslint / types 등 주변 툴 업데이트

4. 각 단계마다 pnpm build + 핵심 기능 체크
