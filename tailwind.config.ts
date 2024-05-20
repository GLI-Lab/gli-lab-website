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
        screens: { // Mobile < 'sm' < 'md' < iPad Mini < 'lg' < iPad Pro < 'xl' < Desktop < '2xl'
            'sm': '640px',   // 기본값
            'md': '768px',   // 기본값
            'lg': '1024px',  // 기본값
            'xl': '1280px',  // 기본값
            '2xl': '1600px', // 기본값 1536px

        },
        extend: {
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