// https://nextjs.org/docs/pages/building-your-application/optimizing/fonts

// import { Inter } from "next/font/google";
// import { Noto_Sans_KR } from "next/font/google";
// import { Roboto } from "next/font/google";
// import { Roboto_Flex } from "next/font/google";
// import { Lora } from "next/font/google";
// import { Noto_Serif_KR } from "next/font/google";

// const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });
// const notoSansKR = Noto_Sans_KR({subsets: ['latin'], variable: '--font-noto-sans-kr' });
// const roboto = Roboto({subsets: ['latin'], weight: ['300', '400', '700', '900'], variable: '--font-roboto' });
// const robotoFlex = Roboto_Flex({subsets: ['latin'], variable: '--font-roboto-flex' });
// const lora = Lora({subsets: ['latin'], variable: '--font-lora' });
// const notoSerifKR = Noto_Serif_KR({subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-noto-serif-kr' });

// Sanserif (고딕) : Pretendard, Inter, Noto Sans KR (본고딕), Roboto
// Serif (명조)    : Lora, Noto Serif KR (본명조)
// 100 – Thin
// 200 – Extra Light
// 300 – Light
// 400 – Regular
// 500 – Medium
// 600 – SemiBold
// 700 – Bold
// 800 – Extra-Bold
// 900 - Black

import localFont from "next/font/local";

// export const pretendard = localFont({
//     src: "../../public/fonts/PretendardVariable.woff2",
//     display: "swap",                // 폰트가 로드될 때까지 시스템 폰트가 사용
//     weight: "45 920",               // 폰트 가중치 범위
//     variable: "--font-pretendard",  // CSS 변수 이름
// });

// ⭐필요한 폰트만 정의해야 폰트 용량을 줄일 수 있음!!!⭐
export const pretendard = localFont({
    src: [
        {
            path: "../../public/fonts/Pretendard-Light.subset.woff2",
            weight: '300',
            style: 'normal',
        },
        {
            path: "../../public/fonts/Pretendard-Regular.subset.woff2",
            weight: '400',
            style: 'normal',
        },
        {
            path: "../../public/fonts/Pretendard-Medium.subset.woff2",
            weight: '500',
            style: 'normal',
        },
        {
            path: "../../public/fonts/Pretendard-SemiBold.subset.woff2",
            weight: '600',
            style: 'normal',
        },
        {
            path: "../../public/fonts/Pretendard-Bold.subset.woff2",
            weight: '700',
            style: 'normal',
        },
        {
            path: "../../public/fonts/Pretendard-Black.subset.woff2",
            weight: '900',
            style: 'normal',
        },
    ],
    display: "swap",                // 폰트가 로드될 때까지 시스템 폰트가 사용
    variable: "--font-pretendard",  // CSS 변수 이름
});