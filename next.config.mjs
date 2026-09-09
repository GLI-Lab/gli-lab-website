const nextConfig = {
    // https://nextjs.org/docs/app/api-reference/next-config-js/rewrites#rewriting-to-an-external-url
    // trailingSlash를 하지 않으면, http://203.252.149.219:3000/jupyterlite -> http://203.252.149.219:3000/style.css 로 불러오게 됨
    // trailingSlash를 하면      , http://203.252.149.219:3000/jupyterlite -> http://203.252.149.219:3000/jupyterlite/ -> http://203.252.149.219:3000/jupyterlite/style.css 로 불러오게 됨
    trailingSlash: true,
    reactStrictMode: true,
    
    // 이미지 최적화 설정
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: process.env.NODE_ENV === 'development' ? 0 : 31536000, // 개발모드에서는 캐시 비활성화
    },
    
    // 정적 파일 캐시 설정
    async headers() {
        return [
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: process.env.NODE_ENV === 'development' 
                            ? 'no-cache, no-store, must-revalidate' 
                            : 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    
    // 브라우저 주소 표시줄의 URL이 변경됨 (사용자가 새 URL로 이동)
    // HTTP 상태 코드 301, 302, 307, 308 등을 사용함
    // 브라우저가 새 URL로 직접 요청을 보냄
    // 다른 도메인으로 이동할 경우 CORS 정책이 적용됨
    async redirects() {
        return [
            {
                source: '/people',
                destination: '/people/members',
                permanent: true,
            },
            {
                source: '/research',
                destination: '/research/topic',
                permanent: true,
            },
            {
                source: '/board',
                destination: '/board/gallery',
                permanent: true,
            },
        ];
    },
    // 브라우저 주소 표시줄의 URL이 변경되지 않음
    // 사용자는 원래 URL을 계속 보게 됨
    // 서버 측에서 대상 URL의 콘텐츠를 가져와 마치 원래 URL에서 온 것처럼 제공
    // 서버에서 프록시 역할을 하므로 CORS 문제가 발생하지 않음
    // Next.js 기본값: {basePath: false, locale: false}
    async rewrites() {
        return [
            {
                source: '/people/professor/:path*',
                destination: 'https://bkoh509.github.io/:path*',
            },
            {
                source: '/publication/:path*',
                destination: 'https://bkoh509.github.io/:path*',
            },
            // --------------------------------------------------------
            // ===== ML 2026 Spring =====
            // 1. 루트 경로 (Next.js가 슬래시 유무 상관없이 모두 매칭하여, 끝에 슬래시가 붙은 목적지로 보냄)
            {
                source: '/board/lectures/ml-2026-spring',
                destination: 'https://gli-lab.github.io/ml-2026-spring/',
            },
            // 2. 확장자가 있는 파일 → 그대로 전달 (슬래시를 포함한 전체 경로 매칭)
            {
                source: '/board/lectures/ml-2026-spring/:path(.*\\..*)',
                destination: 'https://gli-lab.github.io/ml-2026-spring/:path',
            },
            // 3. 확장자 없는 디렉토리 → index.html 강제 주입 (301 리다이렉트 방지)
            {
                source: '/board/lectures/ml-2026-spring/:path*',
                destination: 'https://gli-lab.github.io/ml-2026-spring/:path*/index.html',
            },
            // ===== DM 2026 Fall =====
            {
                source: '/board/lectures/dm-2026-fall',
                destination: 'https://gli-lab.github.io/dm-2026-fall/',
            },
            {
                source: '/board/lectures/dm-2026-fall/:path(.*\\..*)',
                destination: 'https://gli-lab.github.io/dm-2026-fall/:path',
            },
            {
                source: '/board/lectures/dm-2026-fall/:path*',
                destination: 'https://gli-lab.github.io/dm-2026-fall/:path*/index.html',
            },
            // --------------------------------------------------------
            {
                source: '/jupyterlite/:path*',
                destination: 'https://gli-lab.github.io/jupyterlite/:path*',
            },
        ];
    },
};

export default nextConfig;
