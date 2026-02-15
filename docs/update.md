## 1) 특정 패키기 업데이트

```bash
$ pnpm add next@latest
```

- Next 버전만 최신으로 변경하고 나머지는 그대로 둠
- react, react-dom, tailwind, @vercel/analytics 등은 자동으로 최신으로 안 올라감
- 단, Next가 요구하는 peer dependency가 안 맞으면 경고가 뜰 수 있음 (이 경우 React 등을 따로 맞춰야 함)

## 2) 전체 패키지 최신화 (주의)

```bash
$ npx npm-check-updates -u
$ pnpm install
```

- 전체 패키지를 latest로 바꿔버림
- 패키지들 사이의 “최적 조합”은 고려하지 않기 때문에, 디버깅 난이도 급상승함
- 설치 단계에서 pnpm이 호환성 검사는 함 (충돌 시 경고/에러)

## 3) 일부 패키지 최신화 (주의)

```bash
$ npx npm-check-updates -u next react react-dom
$ pnpm install

$ pnpm add next@latest react@latest react-dom@latest
```

- 지정한 3개 패키지를 각각 latest로 올림
- 서로의 “궁합을 계산해서 가장 안전한 조합”을 찾아주지는 않음
- 설치 시 pnpm이 peer dependency 조건을 검사만 함

## 추천하는 방식

1. next 업데이트

2. 필요 시 react, react-dom 버전 맞추기

3. 그 다음에 tailwind / eslint / types 등 주변 툴 업데이트

4. 각 단계마다 pnpm build + 핵심 기능 체크