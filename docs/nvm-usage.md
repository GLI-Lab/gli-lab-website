# NVM / Node.js / npm

Ubuntu와 macOS에서 [NVM](https://github.com/nvm-sh/nvm)으로 Node.js 버전을 설치하고 전환한다. Node.js를 설치하면 그 버전에 포함된 `npm`도 같이 설치된다.

- NVM: https://github.com/nvm-sh/nvm
- Node.js: https://nodejs.org/en

버전 숫자는 계속 바뀐다. 아래 URL과 출력의 버전은 예시이고, 실행 전에 GitHub 릴리스의 최신 태그를 확인한다. 2026-11 기준 설치 스크립트 태그는 `v0.41.0`이다.

## 목차

- [1) NVM 설치](#1-nvm-설치)
- [2) NVM 업데이트](#2-nvm-업데이트)
- [3) Node.js와 npm](#3-nodejs와-npm)
- [4) 설치 가능한 버전 확인](#4-설치-가능한-버전-확인)
- [5) Node.js 설치](#5-nodejs-설치)
- [6) 사용할 버전 바꾸기](#6-사용할-버전-바꾸기)
- [7) Node.js 제거](#7-nodejs-제거)

## 1) NVM 설치

설치 스크립트는 bash로만 동작한다. macOS 기본 셸이 zsh여도 명령 끝은 `| bash`로 둔다.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
```

`git`이 있으면 `~/.nvm`에 클론하고, 이미 있으면 그 저장소를 위 태그에 맞춰 업데이트한다. `git`이 없으면 스크립트만 받는다.

설정이 들어가는 파일은 명령을 친 셸이 아니라 로그인 셸(`$SHELL`) 기준이다.

- bash: `~/.bashrc` (없으면 `~/.bash_profile`)
- zsh: `~/.zshrc` (없으면 `~/.zprofile`)

두 파일에 모두 들어가지는 않는다. 기본 설치 경로는 `~/.nvm`이다. `XDG_CONFIG_HOME`이 설정되어 있으면 `$XDG_CONFIG_HOME/nvm`에 설치되고, 프로필의 `NVM_DIR`도 그 경로로 기록된다.

bash/zsh에는 아래가 추가된다.

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

지금 열린 터미널에는 방금 추가된 설정이 없다. 해당 프로필을 다시 읽거나 터미널을 새로 연다.

```bash
source ~/.bashrc   # bash
source ~/.zshrc    # zsh
```

```bash
nvm --version      # 0.41.0
nvm -v             # 0.41.0
```

## 2) NVM 업데이트

설치와 같은 명령을 실행한다. URL의 태그가 실제로 받게 되는 버전이다. `v0.40.4` URL을 다시 실행하면 0.40.4에 머문다.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
source ~/.bashrc   # 또는 source ~/.zshrc
nvm --version
```

이미 설치된 경우 `nvm is already installed in ~/.nvm, trying to update using git`이 출력된다.

## 3) Node.js와 npm

`node`를 설치하면 그 릴리스에 들어 있는 `npm`이 같이 설치된다. Node 버전을 바꾸면 그 버전에 포함된 `npm`으로 같이 바뀐다.

## 4) 설치 가능한 버전 확인

```bash
nvm ls-remote          # 릴리스 전체
nvm ls-remote --lts    # LTS만
nvm version-remote --lts
nvm version-remote node
```

`nvm install node`는 최신 정식 버전이다. 최신 LTS는 `nvm install --lts`다. `0.40.x`에서는 `node`가 알파 버전을 고를 수 있으므로, 위 1)의 `v0.41.0`으로 올린 뒤 설치한다. `0.41.0`부터는 알파를 기본 선택에서 뺀다.

## 5) Node.js 설치

```bash
nvm install --lts     # 최신 LTS
nvm install node      # 최신 정식 버전
nvm install 24.13.0   # 정확한 버전
nvm install 24        # 24 중 최신 릴리스
```

처음 설치한 버전은 `default`가 된다. 이미 `default`가 있으면 `nvm install`만으로는 바뀌지 않고, 현재 셸만 그 버전을 쓴다. 새 터미널의 기본값까지 바꾸려면 `--default`를 붙이거나 아래 6)의 `nvm alias default`를 실행한다.

```bash
nvm install --lts --default
```

설치된 목록에서 `->`가 현재 셸의 버전이다.

```bash
nvm ls
```

## 6) 사용할 버전 바꾸기

새 터미널에서도 쓸 기본 버전이다. 가리키는 버전이 설치되어 있어야 한다.

```bash
nvm alias default node     # 설치된 것 중 가장 높은 버전. 더 높은 버전을 설치하면 따라감
nvm alias default lts/*    # 최신 LTS
nvm alias default 24.13.0  # 특정 버전
nvm alias default 24       # 설치된 24 중 최신

nvm alias default          # default가 가리키는 대상
nvm version default        # default의 실제 버전
```

이번 터미널에서만 바꾼다. 터미널을 닫으면 `default`로 돌아간다.

```bash
nvm use default
nvm use node
nvm use --lts
nvm use 24.13.0
nvm use 24
```

## 7) Node.js 제거

인자는 버전 하나로 해석된다. `16`이나 `v16`은 16 전체를 지우지 않고, 그중 해석된 버전 하나만 지운다. `nvm uninstall --lts`도 `lts/*`가 가리키는 버전 하나만 지운다.

지금 셸에서 쓰는 버전은 지울 수 없다. 다른 버전으로 `nvm use`한 다음 제거한다.

```bash
nvm use 24
nvm uninstall 22.22.0
nvm uninstall 22          # 설치된 22 중 이 명령이 고른 하나만
nvm uninstall --lts       # 최신 LTS로 해석된 버전 하나만
```

`npm install -g`로 넣은 패키지(pm2, pnpm 등)는 프로젝트 `package.json`이 아니라 그 Node 디렉터리에 있다. 예를 들면 `~/.nvm/versions/node/v24.13.1/lib/node_modules`다. `nvm uninstall`은 그 디렉터리를 지우므로 전역 패키지도 함께 사라진다. `nvm install --lts`는 새 Node를 만들 뿐, 이전 전역 패키지를 가져오지 않는다.

예전 버전을 지우기 전에, 전역 패키지를 새 Node로 복사하면서 설치한다.

```bash
nvm install --lts --reinstall-packages-from=24
```
