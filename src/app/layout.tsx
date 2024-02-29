import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header_v2";

const inter = Inter({ subsets: ["latin"] });
// const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "GLI Lab",
    template: "GLI Lab | %s",
  },
  description: "Graph & Language Intelligence 연구실 홈페이지",
  icons: {
    icon: "/GLI_logo_green.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <div className='flex min-w-screen min-h-screen flex-col items-center'>
      <Header/>
      {children}
    </div>
    </body>
    </html>
  );
}
