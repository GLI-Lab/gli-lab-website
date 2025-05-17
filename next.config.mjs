const nextConfig = {
    // https://nextjs.org/docs/app/api-reference/next-config-js/rewrites#rewriting-to-an-external-url
    // trailingSlash를 하지 않으면, http://203.252.149.219:3000/jupyterlite -> http://203.252.149.219:3000/style.css 로 불러오게 됨
    // trailingSlash를 하면      , http://203.252.149.219:3000/jupyterlite -> http://203.252.149.219:3000/jupyterlite/ -> http://203.252.149.219:3000/jupyterlite/style.css 로 불러오게 됨
    trailingSlash: true,
    reactStrictMode: true,
    
    // 브라우저 주소 표시줄의 URL이 변경됨 (사용자가 새 URL로 이동)
    // HTTP 상태 코드 301, 302, 307, 308 등을 사용함
    // 브라우저가 새 URL로 직접 요청을 보냄
    // 다른 도메인으로 이동할 경우 CORS 정책이 적용됨
    async redirects() {
        return [
            {
                source: '/about',
                destination: '/about/introduction',
                permanent: true,
            },
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
                destination: '/board/news',
                permanent: true,
            },
        ];
    },
    // 브라우저 주소 표시줄의 URL이 변경되지 않음
    // 사용자는 원래 URL을 계속 보게 됨
    // 서버 측에서 대상 URL의 콘텐츠를 가져와 마치 원래 URL에서 온 것처럼 제공
    // 서버에서 프록시 역할을 하므로 CORS 문제가 발생하지 않음
    async rewrites() {
        return [
            {
                source: '/people/professor/:path*',
                destination: 'https://bkoh509.github.io/:path*',
                basePath: false,
                locale: false,
            },
            {
                source: '/publication/:path*',
                destination: 'https://bkoh509.github.io/:path*',
                basePath: false,
                locale: false,
            },
            {
                source: '/jupyterlite/:path*',
                destination: 'https://gli-lab.github.io/jupyterlite/:path*',
                basePath: false,
                locale: false,
            },
        ];
    },
};

export default nextConfig;
