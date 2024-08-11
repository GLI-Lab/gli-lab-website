// text-xs: 아주 작은 텍스트 크기 (0.75rem, 12px)
// text-sm: 작은 텍스트 크기 (0.875rem, 14px)
// text-base: 기본 텍스트 크기 (1rem, 16px)
// text-lg: 약간 큰 텍스트 크기 (1.125rem, 18px)
// text-xl: 큰 텍스트 크기 (1.25rem, 20px)
// text-2xl: 더 큰 텍스트 크기 (1.5rem, 24px)
// text-3xl: 매우 큰 텍스트 크기 (1.875rem, 30px)
// text-4xl: 엄청 큰 텍스트 크기 (2.25rem, 36px)
// text-5xl: 매우 큰 텍스트 크기 (3rem, 48px)
// text-6xl: 굉장히 큰 텍스트 크기 (3.75rem, 60px)
// text-7xl: 초대형 텍스트 크기 (4.5rem, 72px)
// text-8xl: 거대한 텍스트 크기 (6rem, 96px)
// text-9xl: 최대 크기의 텍스트 (8rem, 128px)

// font-thin: 폰트 두께를 100으로 설정
// font-extralight: 폰트 두께를 200으로 설정
// font-light: 폰트 두께를 300으로 설정
// font-normal: 폰트 두께를 400으로 설정 (기본값)
// font-medium: 폰트 두께를 500으로 설정
// font-semibold: 폰트 두께를 600으로 설정
// font-bold: 폰트 두께를 700으로 설정
// font-extrabold: 폰트 두께를 800으로 설정
// font-black: 폰트 두께를 900으로 설정

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        screens: {  // Mobile < 'sm' < 'md' < iPad Mini < 'lg' < iPad Pro < 'xl' < Desktop < '2xl'
            'sm': '640px',     // 기본값
            'md': '768px',     // 기본값
            '1.5md': '880px',  // 기본값(?) 변경
            'lg': '1024px',    // 기본값
            'xl': '1280px',    // 기본값
            '1.5xl': '1440px', // 기본값(?) 변경
            '2xl': '1600px',   // 기본값(1536px) 변경
        },
        extend: {
            //////////////////////////////////////////////////////////////////////////////////////
            // Customized Color (based on https://www.konkuk.ac.kr/konkuk/2109/subview.do)
            ///////////////////////////////////////////////////////////////////////////////////////
            colors: {
                KU: {
                    dark_green: '#036B3F',
                    light_green: "#B8F329",
                    green: "#21BA31",
                    magenta: "#E9708C",
                    yellow: "#F6DB00",
                    violet: "#C283C6",
                    orange: "#F0A704",
                    dark_gray: "#656F76",
                    blue: "#61A7DD",
                    cool_gray: "#B1B3B4",
                    warm_gray: "#B0CDA6",
                    light_gray: "#ECEBE3",
                    beige: "#F0F4DA",
                },
            },
            ///////////////////////////////////////////
            //
            ////////////////////////////////////////////
            backgroundImage: {
                'subcover': "url('/cover/main4-3-dark.webp')"  // use `bg-subcover`
            },
            ///////////////////////////////////////////
            // 폰트 정의
            ////////////////////////////////////////////
            fontFamily: {
                sans: ['var(--font-pretendard)']  // use `font-sans`
                // sans: ['var(--font-pretendard)', 'var(--font-roboto-flex)'],  // use `font-sans`
                // serif: ['var(--font-lora)', 'var(--font-noto-serif-kr)'],     // use `font-serif`
            },
            ////////////////////////////////////////////
            // 애니메이션 정의
            ////////////////////////////////////////////
            keyframes: {
                slide: {
                    '0%, 100%': { 'background-image': 'url("/cover/main1-min-crop.webp")' },
                    '25%': { 'background-image': 'url("/cover/main2.webp")' },
                    '50%': { 'background-image': 'url("/cover/main3.webp")' },
                    '75%': { 'background-image': 'url("/cover/main4-3.webp")' }
                },
                fadeUp: {
                    '0%': {opacity: '0', transform: 'translateY(10px)'},
                    '100%': {opacity: '1', transform: 'translateY(0)'},
                },
                flipDown: {
                    '0%': {
                        transform: 'rotateX(-90deg)',
                        opacity: 0,
                    },
                    '100%': {
                        transform: 'rotateX(0deg)',
                        opacity: 1,
                    },
                },
                dropIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                'slider': 'slide 40s infinite cubic-bezier(0.4, 0, 0.2, 1)', // animate-slider
                // 'slider': 'slide 40s infinite linear', // animate-slider
                'fade-up': 'fadeUp 0.5s ease-out',
                'flip-down': 'flipDown 1s ease-out forwards',
                'drop-in': 'dropIn 0.5s ease-out forwards',
                'drop-in-25': 'dropIn 0.25s ease-out forwards',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}

export default config