## 목차

- [1) Node.js / npm 런타임](#1-nodejs--npm-런타임)
- [2) 전역 도구 (pnpm, pm2)](#2-전역-도구-pnpm-pm2)
- [3) 특정 패키지 업데이트](#3-특정-패키지-업데이트)
- [4) 전체 패키지 최신화 (주의)](#4-전체-패키지-최신화-주의)
- [5) 일부 패키지 최신화 (주의)](#5-일부-패키지-최신화-주의)
- [6) 추천하는 방식](#6-추천하는-방식)
- [7) 브랜치로 안전하게 작업하기](#7-브랜치로-안전하게-작업하기)

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

아래 단계는 `main`이 아니라 [브랜치](#7-브랜치로-안전하게-작업하기)에서 진행한다.

1. next 업데이트

2. 필요 시 react, react-dom 버전 맞추기

3. 그 다음에 tailwind / eslint / types 등 주변 툴 업데이트

4. 각 단계마다 pnpm build + 핵심 기능 체크

5. 전부 통과하면 `main`에 합친다

## 7) 브랜치로 안전하게 작업하기

패키지 업그레이드처럼 여러 단계에 걸치고 중간에 빌드가 깨질 수 있는 작업은 `main`에서 바로 하지 않고 브랜치를 만들어서 한다.

### 흐름

```bash
$ git checkout main
$ git checkout -b upgrade/next-16   # main의 현재 커밋에서 브랜치 생성. 이름은 작업 내용으로

# 패키지 하나마다 "올리기 → 빌드 확인 → 커밋"을 반복
$ pnpm add next@latest
$ pnpm build                        # 깨지면 여기서 멈추고 고친다
$ git commit -am "Upgrade next to 16.4.5"

# 전부 끝났으면 main에 합치기
$ git checkout main
$ git merge upgrade/next-16         # 그동안 main에 새 커밋이 없었다면 충돌 없이 합쳐짐 (fast-forward)
$ git branch -d upgrade/next-16     # 합쳐진 브랜치 삭제
$ git push origin main              # GitHub에도 올릴 때만
```

작업 도중 `main`에 급한 수정이 필요하면, 브랜치에서 하던 것을 먼저 커밋하고 `git checkout main`으로 이동해서 고친 뒤 다시 `git checkout upgrade/next-16`으로 돌아온다. 커밋하지 않은 수정은 브랜치를 옮겨도 따라다니므로 섞이지 않게 커밋해 두는 편이 안전하다.

### 장점

- `main`이 항상 빌드·배포 가능한 상태로 남는다. 업그레이드가 반쯤 진행된 상태에서 급한 수정(뉴스 링크 추가 등)이 생겨도 `main`에서 바로 고쳐 배포할 수 있다.
- 실패하면 `git branch -D upgrade/next-16` 한 줄로 흔적 없이 버린다. `main`에서 했다면 `git reset`으로 커밋을 골라내야 한다.
- `git diff main..upgrade/next-16`으로 그 작업이 바꾼 것 전부를 한 번에 본다.
- 나중에 CI를 붙이면 브랜치를 push해서 PR을 만들었을 때 빌드·타입체크가 자동으로 돌고, 통과한 것만 `main`에 합치는 흐름이 된다.

### 브랜치가 필요 없는 경우

YAML 데이터 수정, 문서 수정, 오타 수정처럼 커밋 한 번으로 끝나고 빌드가 깨질 일 없는 작업은 `main`에 바로 커밋한다.

### 백업과는 다르다

복원 지점은 브랜치가 아니라 커밋이다. 브랜치는 커밋을 가리키는 이름표일 뿐이라, 브랜치가 없어도 `main`의 모든 커밋으로 되돌아갈 수 있다. 그리고 브랜치든 `main`이든 push 전에는 이 컴퓨터에만 있다. 백업이 목적이면 `git push`, 특정 시점에 이름을 붙여 두고 싶으면 `git tag`를 쓴다.
