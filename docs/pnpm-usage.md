# pnpm 사용법 가이드

```bash
# yarn -> pnpm
$ npm install -g pnpm
$ rm -rf node_modules

# package.json에 있는 패키지를 설치함. pnpm-lock.yaml이 있으면 그걸 참고하게됨
# pnpm-lock.yaml / node_modules 생성
$ pnpm install
$ rm yarn.lock
```