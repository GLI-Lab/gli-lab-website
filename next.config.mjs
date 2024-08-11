const nextConfig = {
    // https://nextjs.org/docs/app/api-reference/next-config-js/rewrites#rewriting-to-an-external-url
    // trailingSlash를 하지 않으면, http://203.252.149.219:3000/jupyterlite -> http://203.252.149.219:3000/style.css 로 불러오게 됨
    // trailingSlash를 하면       , http://203.252.149.219:3000/jupyterlite -> http://203.252.149.219:3000/jupyterlite/ -> http://203.252.149.219:3000/jupyterlite/style.css 로 불러오게 됨
    trailingSlash: true,
    reactStrictMode: true,
    async redirects() {
        console.log('Redirect called');
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
                source: '/people/professor',
                destination: 'https://bkoh509.github.io/',
                permanent: true,
            },
            {
                source: '/publication',
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
    async rewrites() {
        console.log('Rewrite called');
        return [
            // {
            //     source: '/people/professor/:path*',
            //     destination: 'https://bkoh509.github.io/:path*',
            // },
            // {
            //     source: '/test/:path*',
            //     destination: 'https://bkoh509.github.io/:path*',
            // },
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
