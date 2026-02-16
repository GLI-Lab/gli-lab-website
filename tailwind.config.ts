// [Vision and Topics]
// 비전      : text-lg md:text-xl font-normal text-gray-900 leading-relaxed tracking-tight  # 18px / 20px
// 타이틀    : text-lg md:text-xl font-semibold text-brand-primary leading-snug             # 18px / 20px
// 설명      : text-[14.5px] md:text-[16.5px] text-gray-600 leading-normal                  # 14.5px / 16.5px
// 뱃지/버튼 : text-sm md:text-base text-gray-600 text-sm md:text-base font-medium          # 14px / 16px

// [Projects]
// 타이틀     : text-base md:text-lg font-semibold text-gray-800 leading-snug   # 16px / 18px
// 메타데이터 : text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug       # 14.5px / 16.5px
// 보조설명   : text-[14px] md:text-[16px] text-gray-600 leading-snug           # 14px / 16px
// 뱃지       : inline-block bg-brand-primary/10 text-brand-primary text-[13.5px] md:text-[15.5px] px-2 py-0.5 md:py-0.25 rounded-md shrink-0  # 13.5px / 15.5px
// 뱃지       : inline-block bg-gray-100 text-gray-600 text-[13.5px] md:text-[15.5px] px-2 py-0.5 md:py-0.25 rounded-md shrink-0               # 13.5px / 15.5px

// text-xs   (12px, 0.75rem)     
// text-[15px]                :                          (데스크탑) 뱃지, 메타데이터(서브)
// text-sm   (14px, 0.875rem) : (모바일) 일반 보조       (데스크탑) 버튼(Link/Code)
// text-base (16px, 1rem)     : (모바일) HOME/일반 본문, (데스크탑) 메타데이터
// text-lg   (18px, 1.125rem) :                          (데스크탑) 본문
// text-xl   (20px, 1.25rem)  :                          (데스크탑) Home
// text-2xl  (24px, 1.5rem)     
// text-3xl  (30px, 1.875rem)     
// text-4xl  (36px, 2.25rem)     
// text-5xl  (48px, 3rem)     
// text-6xl  (60px, 3.75rem)     
// text-7xl  (72px, 4.5rem)     
// text-8xl  (96px, 6rem)     
// text-9xl  (128px, 8rem)     

// font-thin       : 100
// font-extralight : 200
// font-light      : 300
// font-normal     : 400 기본값
// font-medium     : 500 컨트롤러
// font-semibold   : 600 기본값 강조, 필터
// font-bold       : 700 커버 타이틀, Home 타이틀
// font-extrabold  : 800
// font-black      : 900

// leading-none    : line-height: 1 
// leading-tight   : line-height: 1.25 
// leading-snug    : line-height: 1.375 
// leading-normal  : line-height: 1.5 
// leading-relaxed : line-height: 1.625 
// leading-loose   : line-height: 2 

// gray-800: 타이틀
// gray-700: 본문, 필터
// gray-600: 메타데이터
// gray-500: 데코레이션
// gray-300: 박스 border 호버
// gray-200: 박스 border
// text-red-600: 빨강 강조

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
        screens: {  // Mobile < 'sm' < ⭐'md' < iPad Mini(768px) < '1.5md' < ⭐'lg' < iPad Pro < ⭐'xl' < Desktop < '2xl'
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