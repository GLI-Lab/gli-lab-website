const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/about', // 리디렉션을 시작할 경로
                destination: '/about/introduction', // 리디렉션할 목적지 경로
                permanent: true,
            },
            {
                source: '/people',
                destination: '/people/members',
                permanent: true,
            },
            {
                source: '/people/professor',
                destination: 'https://bkoh509.github.io/',
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
};

export default nextConfig;
