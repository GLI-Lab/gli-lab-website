import { Inter } from "next/font/google";
// import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header_v2";
import {Metadata} from "next";
import {getMetadata} from "@/lib/GetMetadata";

const inter = Inter({ subsets: ["latin"] });
// const open_sans = Open_Sans({ subsets: ["latin"] });


export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    // title: `반짝반짝 빛날 ${username}님의 인생지도`,
    // asPath: `/home/${username}`
    title: `Home`,
  });
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${inter.className}`}>
      <Header/>
      {children}
    </body>
    </html>
  );
}
