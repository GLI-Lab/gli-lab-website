# PM2 사용법 가이드

PM2는 Node.js 애플리케이션을 위한 프로덕션 프로세스 매니저입니다. 내장된 로드 밸런서와 함께 애플리케이션을 데몬화하고 관리할 수 있습니다.

## 설치

### Yarn을 사용한 설치
```bash
yarn global add pm2
```

### npm을 사용한 설치
```bash
npm install -g pm2

#### 설치 위치 확인 방법
```bash
# 현재 pm2 위치 확인
which pm2

# Yarn global bin 경로 확인
yarn global bin

# npm global 경로 확인
npm config get prefix
```

#### 권장사항
- **일관성 유지**: 프로젝트에서 yarn을 사용한다면 global 패키지도 yarn으로 설치
- **NVM 사용시**: npm으로 설치하는 것이 PATH 관리 측면에서 편리
- **팀 환경**: 팀에서 사용하는 패키지 매니저와 동일하게 맞추기

## 기본 사용법

#### 개발 서버 시작
```bash
pm2 start "yarn dev -p 3000" --name "glilab"
pm2 start "npm run dev" --name "glilab"

pm2 start "yarn start" --name "glilab"
pm2 start npm --name "glilab" -- start

pm2 start "yarn start -p 3001" --name "glilab-prod"
```




### 2. 프로세스 관리

#### 실행 중인 프로세스 확인
```bash
pm2 list
pm2 ls
```

#### 프로세스 상세 정보 확인
```bash
pm2 show <app-name>
pm2 show gli-lab-dev
```

#### 프로세스 중지
```bash
pm2 stop <app-name>
pm2 stop all
```

#### 프로세스 재시작
```bash
pm2 restart <app-name>
pm2 restart all
```

#### 프로세스 삭제
```bash
pm2 delete <app-name>
pm2 delete all
```

### 3. 로그 관리

#### 실시간 로그 확인
```bash
pm2 logs
# 특정 앱의 로그만 확인
pm2 logs <app-name>
```

#### 로그 파일 위치
```bash
pm2 logs --lines 200  # 최근 200줄 확인
```

#### 로그 초기화
```bash
pm2 flush
```

### 4. 모니터링

#### 실시간 모니터링
```bash
pm2 monit
```

#### 프로세스 상태 확인
```bash
pm2 status
```


## 시스템 시작 시 자동 실행

### 1. 시작 스크립트 생성
```bash
pm2 startup
```

### 2. 현재 프로세스 목록 저장
```bash
pm2 save
```

### 3. 저장된 프로세스 복원
```bash
pm2 resurrect
```

## 설정 파일 사용 (ecosystem.config.js)

프로젝트 루트에 `ecosystem.config.js` 파일을 생성하여 PM2 설정을 관리할 수 있습니다:

```javascript
module.exports = {
  apps: [
    {
      name: 'gli-lab-dev',
      script: 'yarn',
      args: 'dev',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'gli-lab-prod',
      script: 'yarn',
      args: 'start',
      cwd: './',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### 설정 파일로 실행
```bash
# 개발 환경
pm2 start ecosystem.config.js --only gli-lab-dev

# 프로덕션 환경
pm2 start ecosystem.config.js --only gli-lab-prod

# 모든 앱 실행
pm2 start ecosystem.config.js
```

## 유용한 팁

### 1. 별칭(Alias) 설정
자주 사용하는 명령어에 대한 별칭을 설정할 수 있습니다:

```bash
# ~/.bashrc 또는 ~/.zshrc에 추가
alias pm2-dev="pm2 start 'yarn dev' --name 'gli-lab-dev'"
alias pm2-prod="pm2 start 'yarn start' --name 'gli-lab-prod'"
alias pm2-stop="pm2 stop all"
alias pm2-logs="pm2 logs --lines 100"
```

### 2. 개발 워크플로우

```bash
# 1. 개발 서버 시작
pm2-dev

# 2. 코드 수정 후 재시작이 필요한 경우
pm2 restart gli-lab-dev

# 3. 로그 확인
pm2 logs gli-lab-dev

# 4. 작업 완료 후 정리
pm2 delete gli-lab-dev
```

### 3. 프로덕션 배포

```bash
# 1. 코드 빌드
yarn build

# 2. 프로덕션 서버 시작
pm2 start ecosystem.config.js --only gli-lab-prod

# 3. 상태 확인
pm2 status

# 4. 시스템 재시작 시 자동 실행 설정
pm2 save
```

## 문제 해결

### Tailwind v4 + PostCSS 에러: "You're trying to use `tailwindcss` directly as a PostCSS plugin"

Tailwind CSS 4부터는 PostCSS 플러그인이 별도 패키지로 분리되었습니다. 다음 단계로 해결하세요:

```bash
# 1) 플러그인 설치 (devDependencies)
yarn add -D @tailwindcss/postcss

# 2) PostCSS 설정 업데이트 (postcss.config.js)
# 기존
#   plugins: { tailwindcss: {}, autoprefixer: {} }
# 변경
#   plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} }

# 3) PM2 재시작으로 반영
pm2 restart glilab --update-env
```

설정 예시 (`postcss.config.js`):

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

재시작 후 로그에서 에러가 사라졌는지 확인하세요:

```bash
pm2 logs glilab --lines 100
```

### PM2 명령어를 찾을 수 없는 경우

#### Yarn으로 설치한 경우

1. **PATH 확인:**
```bash
echo $PATH
```

2. **Yarn global bin 경로 확인:**
```bash
yarn global bin
```

3. **PATH에 추가:**
```bash
echo 'export PATH="$PATH:$(yarn global bin)"' >> ~/.bashrc
source ~/.bashrc
```

4. **임시로 전체 경로 사용:**
```bash
/home/username/.yarn/bin/pm2 list
```

#### npm으로 설치한 경우

1. **npm global 경로 확인:**
```bash
npm config get prefix
```

2. **권한 문제가 있는 경우 npm prefix 변경:**
```bash
npm config set prefix ~/.npm-global
echo 'export PATH="$PATH:~/.npm-global/bin"' >> ~/.bashrc
source ~/.bashrc
```

3. **NVM 사용시 Node.js 버전 확인:**
```bash
nvm current
nvm use stable
```

### 프로세스가 계속 재시작되는 경우

1. **로그 확인:**
```bash
pm2 logs <app-name>
```

2. **자동 재시작 비활성화:**
```bash
pm2 start app.js --no-autorestart
```

### 메모리 사용량이 높은 경우

1. **메모리 제한 설정:**
```bash
pm2 start app.js --max-memory-restart 500M
```

2. **모니터링:**
```bash
pm2 monit
```

## 참고 자료

- [PM2 공식 문서](https://pm2.keymetrics.io/)
- [PM2 GitHub 저장소](https://github.com/Unitech/pm2)
- [PM2 치트시트](https://devhints.io/pm2)

---

이 문서는 GLI-Lab 프로젝트에서 PM2를 효과적으로 사용하기 위한 가이드입니다. 추가 질문이나 문제가 있으면 팀에 문의하세요. 