# pnpm 사용법 가이드

## 목차

- [1) pnpm 설치](#1-pnpm-설치)
- [2) Yarn에서 pnpm으로 이전](#2-yarn에서-pnpm으로-이전)
- [3) 특정 패키지 설치](#3-특정-패키지-설치)
- [4) 업데이트](#4-업데이트)

## 1) pnpm 설치

Yarn로 깔아 둔 프로젝트가 아닐 때 사용한다. 첫 명령은 `pnpm` 프로그램을 현재 Node에 설치하고, 둘째 명령은 프로젝트 의존성을 설치한다.

```bash
# 현재 Node에 pnpm 설치. package.json에는 기록되지 않음
$ npm install -g pnpm

# 프로젝트 디렉터리에서 실행
# package.json의 패키지를 설치하고 pnpm-lock.yaml / node_modules 생성
# pnpm-lock.yaml이 있으면 그 버전을 따름
$ pnpm install
```

## 2) Yarn에서 pnpm으로 이전

Yarn를 쓰던 프로젝트를 pnpm으로 옮길 때 실행한다. `node_modules`와 `yarn.lock`을 지우는 이유는 Yarn가 만든 폴더와 잠금 파일을 제거하기 위해서다.

```bash
# 현재 Node에 pnpm 설치. package.json에는 기록되지 않음
$ npm install -g pnpm

# Yarn가 만든 node_modules 제거. pnpm과 폴더 구조가 다름
$ rm -rf node_modules

# package.json의 패키지를 설치하고 pnpm-lock.yaml / node_modules 생성
# pnpm-lock.yaml이 있으면 그 버전을 따름
# pnpm-lock.yaml이 없고 yarn.lock만 있으면 yarn.lock을 읽어 잠금 파일을 만듦
$ pnpm install

# 이전이 끝난 뒤 Yarn 잠금 파일 제거. pnpm install보다 먼저 지우면 yarn.lock의 버전을 가져오지 못함
$ rm yarn.lock
```

## 3) 특정 패키지 설치

프로젝트 디렉터리에서 실행한다. `package.json`과 `pnpm-lock.yaml`에 기록된다.

```bash
# dependencies에 추가
$ pnpm add js-yaml

# devDependencies에 추가
$ pnpm add -D @types/js-yaml

# 버전을 지정해서 추가. latest는 레지스트리 최신 버전
$ pnpm add next@15.5.7
$ pnpm add next@latest
```

## 4) 업데이트

`pnpm`은 프로젝트 `package.json`이 아니라 현재 Node의 전역 경로에 설치된다. 아래 확인 명령은 설치하지 않는다.

```bash
$ npm ls -g --depth=0 pnpm
$ pnpm -v
$ npm view pnpm version
```

최신으로 올리는 명령은 설치와 같다. NVM을 쓰면 지금 활성화된 Node 버전에만 반영된다.

```bash
$ npm install -g pnpm@latest
```
