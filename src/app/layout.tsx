import "./globals.css";
import {Metadata} from "next";

export const generateMetadata = async (): Promise<Metadata> => {
    return getMetadata({
        title: `Home`,
        // asPath: `/home/${username}`
    });
};

import {pretendard} from "./fonts"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {getMetadata} from "@/lib/GetMetadata";
import Header from "@/components/Header_v2";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";


// min-h-screen: 클래스를 사용해 최소 높이를 브라우저 창의 높이와 같게 설정
// flex-grow   : <main>이 부모 컨테이너 <body>의 여유 공간을 모두 차지하도록 함
//               (<Footer/>가 맨 아래에 붙어있게 됨)
export default function RootLayout({children,}:
    Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="en" className={`${pretendard.variable}`}>
            <body className={`flex flex-col min-h-screen min-w-[370px] 
                              font-sans text-[#333] text-[16px] sm:text-[17px] md:text-[19px] lg:text-[20px]`}>
                <Analytics/>
                <SpeedInsights/>
                <Header/>
                <ScrollToTop />
                <main className="flex-grow pb-10">
                    {children}
                </main>
                <Footer/>
            </body>
        </html>
    );
}
