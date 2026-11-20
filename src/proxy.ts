import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_AUTH_REALM, getAdminPassword, isAdminAuthorization } from '@/lib/adminAuth';

/**
 * 관리자 주소(/admin/…)에 비밀번호를 건다. 다른 주소의 요청은 여기를 거치지 않는다 (아래 matcher).
 *
 * Next.js 16에서 `middleware.ts`의 이름이 `proxy.ts`로 바뀌었다. 요청이 페이지에 닿기 전에 실행된다.
 * 관리자 페이지의 수정·초기화(서버 액션)도 같은 주소로 가는 POST 요청이라 여기서 함께 걸린다.
 * 다만 여기만 믿지 않고 page와 각 서버 액션에서도 다시 확인한다 (`src/lib/adminAuth.ts`의 설명 참고).
 */
export const config = {
  matcher: ['/admin/:path*'],
};

export function proxy(request: NextRequest) {
  // 비밀번호가 설정되지 않았으면 로그인 창을 띄우지 않고 그대로 넘긴다. page가 404로 답한다.
  if (!getAdminPassword()) return NextResponse.next();

  if (isAdminAuthorization(request.headers.get('authorization'))) return NextResponse.next();

  // 브라우저가 이 응답을 받으면 기본 로그인 창을 띄운다.
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${ADMIN_AUTH_REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
    },
  });
}
