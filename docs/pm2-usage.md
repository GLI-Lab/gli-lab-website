# PM2 사용법 가이드

PM2는 Node.js 애플리케이션을 위한 프로덕션 프로세스 매니저로, 애플리케이션을 백그라운드(데몬)로 실행하고, 자동 재시작/로그 관리/클러스터 실행 등을 지원함

> **PM2를 글로벌로만 쓸 거라면, npm으로 설치해도 충분함**  
> PM2는 프로젝트 의존성이라기보다 “서버 전역 관리 도구”에 가깝기 때문에, PM2를 설치할 때 pnpm을 굳이 쓸 필요가 없음

## 1) 설치 (글로벌)

### npm (권장)

```bash
npm install -g pm2
```

## 2) 기본 사용법

### package.json 스크립트 실행
```bash
# 개발 서버 시작
pm2 start "pnpm dev -p 3000" --name "glilab"

# 프로덕션 서버 시작
pm2 start "pnpm start" --name "glilab"
pm2 start "pnpm start -p 3001" --name "glilab-prod"
```

### 더 안정적인 실행 방식 (pnpm 바이너리를 직접 실행)
```bash
# 개발 서버 시작
pm2 start pnpm --name "glilab" -- dev -p 3000

# 프로덕션 서버 시작
pm2 start pnpm --name "glilab" -- start
pm2 start pnpm --name "glilab-prod" -- start -p 3001
```

## 3) 프로세스 관리
```bash
pm2 list              # 현재 PM2로 실행 중인 모든 프로세스 목록 확인
pm2 ls

pm2 logs              # 모든 애플리케이션의 실시간 로그 출력
pm2 logs glilab       # 특정 애플리케이션(glilab)의 로그만 출력

pm2 monit             # CPU/메모리 등 실시간 모니터링 대시보드 실행

pm2 restart glilab    # glilab 프로세스 재시작 (코드 변경 후 사용)
pm2 restart all

pm2 stop glilab       # glilab 프로세스 중지 (삭제는 아님, 목록에는 남음)
pm2 stop all

pm2 delete glilab     # glilab 프로세스를 PM2 목록에서 완전히 제거
pm2 delete all
```

## 4) 전체 사용법

### 신규 서버 세팅 or 배포 업데이트
```bash
git pull
pnpm install
pnpm build
pm2 restart glilab
```

### 자동실행 등록
처음 한 번만 설정하면 됨
```bash
pm2 start pnpm --name glilab -- start
pm2 save
pm2 startup
# 이후, 안내되는 sudo ... 명령을 실행해야 함
```