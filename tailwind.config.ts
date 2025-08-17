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

// leading-none      /* line-height: 1 */
// leading-tight     /* line-height: 1.25 */
// leading-snug      /* line-height: 1.375 */
// leading-normal    /* line-height: 1.5 */
// leading-relaxed   /* line-height: 1.625 */
// leading-loose     /* line-height: 2 */

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
        screens: {  // Mobile < 'sm' < 'md' < iPad Mini(768px) < '1.5md' < 'lg' < iPad Pro < 'xl' < Desktop < '2xl'
            'sm'   : '640px',  // 기본값
            'md'   : '768px',  // 기본값
            '1.5md': '880px',  // 추가
            'lg'   : '1024px', // 기본값
            'xl'   : '1280px', // 컨텐츠(default), 기본값
            '1.5xl': '1440px', // 컨텐츠(Members), 추가
            '2xl'  : '1600px', // 커버, 기본값(1536px) 변경
        },
        extend: {
            //////////////////////////////////////////////////////////////////////////////////////
            // 색상 정의
            ///////////////////////////////////////////////////////////////////////////////////////
            // border-gray-200 : 테두리, 구분선
            // bg-gray-100     : 회색 배경색
            colors: {
                // 기능별 색상 그룹화 (새로운 권장 방식)
                brand: {
                    primary: '#036B3F',      // 메인 브랜드 컬러
                    secondary: '#656F76',    // 보조 브랜드 컬러
                },
                text: {
                    primary: '#1f2937',      // 기본 텍스트
                    secondary: '#656F76',    // 보조 텍스트
                    accent: '#036B3F',       // 강조 텍스트
                    muted: '#9ca3af',        // 흐린 텍스트
                },
                background: {
                    primary: '#ffffff',      // 기본 배경
                    secondary: '#f9fafb',    // 보조 배경
                    accent: '#036B3F',       // 강조 배경
                },
                border: {
                    primary: '#e5e7eb',      // 기본 테두리
                    secondary: '#d1d5db',    // 보조 테두리
                    accent: '#036B3F',       // 강조 테두리
                },
                interactive: {
                    primary: '#036B3F',      // 기본 인터랙션
                    hover: '#065f37',        // 호버 상태
                    active: '#054a2b',       // 액티브 상태
                    disabled: '#9ca3af',     // 비활성 상태
                },
                
                // 기존 KU 색상 (하위 호환성 유지)
                KU: {
                    dark_green: '#036B3F',   // 🟢 메인 브랜드 컬러 (가장 많이 사용)
                    dark_gray: "#656F76",    // ⚫ 보조 텍스트 컬러 (제한적 사용)
                },
            },
            ///////////////////////////////////////////
            //
            ////////////////////////////////////////////
            backgroundImage: {
                // 'subcover' configuration removed - now using inline styles
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
                cinematic1: {
                    '0%, 15%': { 
                        opacity: '1', 
                        transform: 'scale(1) rotate(0deg)',
                        filter: 'brightness(1) blur(0px)'
                    },
                    '25%, 80%': { 
                        opacity: '0', 
                        transform: 'scale(1.15) rotate(1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    },
                    '100%': { 
                        opacity: '1', 
                        transform: 'scale(1) rotate(0deg)',
                        filter: 'brightness(1) blur(0px)'
                    }
                },
                cinematic2: {
                    '0%, 15%': { 
                        opacity: '0', 
                        transform: 'scale(1.15) rotate(-1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    },
                    '25%, 40%': { 
                        opacity: '1', 
                        transform: 'scale(1) rotate(0deg)',
                        filter: 'brightness(1) blur(0px)'
                    },
                    '50%, 100%': { 
                        opacity: '0', 
                        transform: 'scale(1.15) rotate(1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    }
                },
                cinematic3: {
                    '0%, 40%': { 
                        opacity: '0', 
                        transform: 'scale(1.15) rotate(1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    },
                    '50%, 65%': { 
                        opacity: '1', 
                        transform: 'scale(1) rotate(0deg)',
                        filter: 'brightness(1) blur(0px)'
                    },
                    '75%, 100%': { 
                        opacity: '0', 
                        transform: 'scale(1.15) rotate(-1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    }
                },
                cinematic4: {
                    '0%, 65%': { 
                        opacity: '0', 
                        transform: 'scale(1.45) rotate(-1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    },
                    '75%, 90%': { 
                        opacity: '1', 
                        transform: 'scale(1.3) rotate(0deg)',
                        filter: 'brightness(1) blur(0px)'
                    },
                    '100%': { 
                        opacity: '0', 
                        transform: 'scale(1.45) rotate(1deg)',
                        filter: 'brightness(0.8) blur(1px)'
                    }
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
                'cinematic-1': 'cinematic1 40s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'cinematic-2': 'cinematic2 40s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'cinematic-3': 'cinematic3 40s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'cinematic-4': 'cinematic4 40s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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