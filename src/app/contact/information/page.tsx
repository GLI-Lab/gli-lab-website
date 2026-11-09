import { Metadata } from "next";
import { FaCheck } from "react-icons/fa";

import { SubCover } from "@/components/Covers";
import KakaoMap from "@/components/KakaoMap";
import { getMetadata } from "@/lib/GetMetadata";

const TITLE = "Email & Location";
const PATHNAME = "/contact/information";

const LINK_CLASS =
  "group underline-offset-4 hover:underline hover:decoration-1.5";

function LinkIcon() {
  return (
    <svg
      className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

const CAMPUS_ADDRESS = "05029 서울시 광진구 능동로 120";
const CAMPUS_MAP_URL = `https://map.kakao.com/link/search/${encodeURIComponent("서울시 광진구 능동로 120")}`;
const PROFESSOR_OFFICE_MAP_URL =
  "https://map.kakao.com/link/map/교수 연구실,37.541162,127.079852";
const STUDENT_LAB_MAP_URL =
  "https://map.kakao.com/link/map/학생 연구실,37.540605,127.079538";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: TITLE,
  });
};

export default function Page() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <SubCover
          title={TITLE}
          pathname={PATHNAME}
          pattern="diagonal-lines"
          colorVariant="sage"
          showBreadcrumb={false}
        />
      </div>

      <div className="max-w-screen-2xl mx-auto bg-white">
        <div
          className="max-w-screen-xl mx-auto flex flex-col items-center justify-center text-center space-y-8
                        py-8 md:py-16 px-4 md:px-6"
        >
          <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
            E-mail
          </p>

          <ul className="list-none list-inside space-y-4 md:space-y-8 text-left text-home">
            <li className="flex space-x-2">
              <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0" />
              <span>
                <span className="font-semibold pr-2">교수#1: </span>
                <a href="mailto:bkoh@konkuk.ac.kr" className={LINK_CLASS}>
                  bkoh@konkuk.ac.kr
                  <LinkIcon />
                </a>
              </span>
            </li>
            <li className="flex space-x-2">
              <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0" />
              <span>
                <span className="font-semibold pr-2">교수#2: </span>
                <a href="mailto:bkoh509@gmail.com" className={LINK_CLASS}>
                  bkoh509@gmail.com
                  <LinkIcon />
                </a>
              </span>
            </li>
          </ul>

          <p className="font-bold tracking-tighter text-[28px] md:text-[36px]">
            Location
          </p>

          <ul className="list-none list-inside space-y-4 md:space-y-8 text-left text-home">
            <li className="flex space-x-2">
              <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0" />
              <span>
                <span className="font-semibold pr-2">주소:</span>
                <a
                  href={CAMPUS_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  {CAMPUS_ADDRESS}
                  <LinkIcon />
                </a>
              </span>
            </li>
            <li className="flex space-x-2">
              <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0" />
              <span>
                <span className="font-semibold pr-2">교수 연구실:</span>
                <a
                  href={PROFESSOR_OFFICE_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  공학관C동 384-2호
                  <LinkIcon />
                </a>
              </span>
            </li>
            <li className="flex space-x-2">
              <FaCheck className="text-green-800 mt-0.5 text-[18px] md:text-[20px] flex-shrink-0" />
              <span>
                <span className="font-semibold pr-2">학생 연구실:</span>
                <a
                  href={STUDENT_LAB_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  신공학관 1002호
                  <LinkIcon />
                </a>
              </span>
            </li>
          </ul>

          <KakaoMap />
        </div>
      </div>

      <div className="h-40" />
    </>
  );
}
