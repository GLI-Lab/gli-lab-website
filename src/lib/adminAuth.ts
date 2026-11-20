import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * 관리자 페이지(/admin/…)의 비밀번호 확인. 서버 전용.
 *
 * 방식: HTTP Basic 인증. 브라우저가 기본 로그인 창을 띄우고, 한 번 통과하면 그 뒤의 요청마다
 * `Authorization: Basic …` 헤더를 붙여 보낸다. 로그인 화면이나 쿠키를 따로 만들지 않는다.
 *   - 비밀번호는 환경변수 `ADMIN_PASSWORD`에 둔다 (Vercel의 Environment Variables와 로컬의 `.env.local`).
 *   - 아이디 칸에는 아무 값이나 넣어도 된다. 비밀번호만 본다.
 *   - `ADMIN_PASSWORD`가 없거나 너무 짧으면 관리자 기능 전체가 닫힌다 (아무도 통과하지 못한다).
 *
 * 확인하는 곳은 세 군데다. 하나가 빠져도 나머지가 막도록 겹쳐 둔다.
 *   1. `src/proxy.ts`         /admin/ 아래 요청이 페이지에 닿기 전. 로그인 창(401)을 띄우는 곳도 여기다.
 *   2. 관리자 page            그릴 때 한 번 더 확인하고, 통과하지 못하면 404
 *   3. 관리자 서버 액션       수정·초기화 요청마다 확인 (화면을 거치지 않고 요청만 보낼 수도 있기 때문)
 */

/** 이보다 짧은 비밀번호는 받지 않는다. 시도 횟수를 제한하는 장치가 없어서, 짧으면 무작위 대입에 뚫릴 수 있다. */
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

/** 로그인 창에 표시되는 이름 */
export const ADMIN_AUTH_REALM = 'GLI Lab Admin';

/** 설정된 관리자 비밀번호. 없거나 너무 짧으면 null */
export function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < ADMIN_PASSWORD_MIN_LENGTH) return null;
  return password;
}

/**
 * 요청의 `Authorization` 헤더 값이 관리자 비밀번호와 맞는지.
 * 비밀번호가 설정되지 않았으면 항상 false.
 */
export function isAdminAuthorization(authorization: string | null | undefined): boolean {
  const password = getAdminPassword();
  if (!password || !authorization) return false;

  const [scheme, encoded] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return false;

  // "아이디:비밀번호"를 base64로 감싼 값. 비밀번호에 ':'이 들어 있을 수 있으므로 첫 ':'에서만 나눈다.
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator === -1) return false;
  const given = decoded.slice(separator + 1);

  // 길이가 같은 해시끼리 비교해, 걸린 시간으로 비밀번호를 추측할 수 없게 한다.
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(given), digest(password));
}
