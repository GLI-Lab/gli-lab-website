import Link from "next/link";
import { Metadata } from "next";

import { SubCover } from "@/components/Covers";
import { getMetadata } from "@/lib/GetMetadata";

const TITLE = "404";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
  });
};

export default function NotFound() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover
          title={TITLE}
          pathname="/"
          pattern="diagonal-lines"
          colorVariant="sage"
          showBreadcrumb={false}
        />
      </div>

      <div className="max-w-screen-2xl mx-auto bg-white">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="flex flex-col items-center text-center space-y-5">
            <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
              Page not found
            </p>
            <p className="text-[16px] md:text-[18px] font-normal text-gray-800 leading-[1.8] tracking-normal max-w-xl">
              The address may be incorrect, or the page may have been moved or deleted.
            </p>
            <Link
              href="/"
              className="px-6 py-2 bg-green-800 hover:bg-[#f4f4f4] border-2 border-green-800 hover:text-green-800 text-white font-semibold rounded-lg shadow-lg transition duration-300"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      <div className="h-40" />
    </>
  );
}
