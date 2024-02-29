"use client"

import Image from 'next/image'
import {useState} from "react"
import Link from "next/link"
import {ChevronDown, Menu} from "lucide-react"
import * as React from "react";

export default function Header() {
  const [menu, setMenu] = useState(false)

  const [activeMenu, setActiveMenu] = useState<number | null>(null);


  // 메뉴 항목 정의 (서브 메뉴를 포함할 수 있도록)
  const menus = [
    {
      title: "About",
      path: "/about/introduction",
      subMenus: [
        { title: "Introduction", path: "/about/introduction" },
        { title: "Contact", path: "/about/contact" },
        { title: "Opening", path: "/about/opening" }
      ]
    },
    {
      title: "Member",
      path: "/member/professor",
      subMenus: [
        { title: "Professor", path: "/member/professor" },
        { title: "Member", path: "/member/member" }
      ]
    },
    {
      title: "Research",
      path: "/research/topic",
      subMenus: [
        { title: "Research Topic", path: "/research/topic" },
        { title: "Project", path: "/research/lab" }
      ]
    },
    {
      title: "Publication",
      path: "/publication",
    },
    {
      title: "Board",
      path: "/board/news",
      subMenus: [
        { title: "News", path: "/board/news" },
        { title: "Gallery", path: "/board/team" },
        { title: "Lecture", path: "/board/lecture" },
        { title: "Resources", path: "/board/resources"},
      ]
    },
  ];

  // const menus = [
  //   {title: "About", path: "/about"},
  //   {title: "Members", path: "/menbers"},
  //   {title: "Research", path: "/research"},
  //   {title: "Publications", path: "/publications"},
  //   {title: "Lectures", path: "/lectures"},
  // ]

  return (
    <nav className="bg-white w-full border-b md:border-b-1">
      <div className="items-center max-w-screen-xl pl-6 pr-6 mx-auto md:flex md:pr-14">
        <div className="flex items-center justify-between py-3 md:py-3 md:block">

          {/* 네비게이션 로고 */}
          <Link href="/" className="items-center flex min-w-[270px]">
            {/*lg:h-20 lg:w-20*/}
            <div className="h-[70px] w-[70px]">
              <Image src="/GLI_logo_green.png" alt="logo" width="96" height="96" layout="intrinsic"/>
            </div>
            {/*lg:text-[24px]*/}
            <div className="-space-y-1 ml-3 text-gray-600 font-medium text-[20px] md:text-[20px]">
              <p>Graph & Language</p>
              <p>Intelligence Lab.</p>
            </div>
          </Link>

          {/* 네비게이션 햄버거 아이콘 */}
          <div className="md:hidden">
            <button
              className="text-gray-800 outline-none p-2 rounded-md focus:border-gray-400 focus:border"
              onClick={() => setMenu(!menu)}
            >
              <Menu className="h-7 w-7"/>
            </button>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        {/*<div className={`flex-1 justify-self-center pb-3 mt-2 md:block md:pb-0 md:mt-0 ${*/}
        {/*  menu ? "animate-fadeIn" : "hidden"}`}>*/}
        {/*  <ul className="justify-end items-center space-y-6 md:flex md:space-x-4 md:space-y-0 lg:space-x-10">*/}
        {/*    {menus.map((item, idx) => (*/}
        {/*      <li key={idx} className="text-gray-600 hover:text-green-800 hover:font-bold">*/}
        {/*        <Link href={item.path}>{item.title}</Link>*/}
        {/*      </li>*/}
        {/*    ))}*/}
        {/*  </ul>*/}
        {/*</div>*/}

        {/* ############################################## */}
        {/* # DESKTOP: 네비게이션 메뉴 (hidden md:block) # */}
        {/* ############################################## */}
        <div className="hidden md:block flex-1 mt-2 md:pb-0 md:mt-0">
          <ul className="justify-end items-center md:flex md:space-x-5 md:space-y-0 lg:space-x-10">
            {menus.map((item, idx) => (
              <li key={idx} className="relative text-gray-600"  // 서브 메뉴 리스트 선택할 수 있게
                  onMouseEnter={() => setActiveMenu(idx)}  // 호버 시 서브 메뉴 활성화
                  onMouseLeave={() => setActiveMenu(null)}  // 호버 해제 시 서브 메뉴 비활성화
              >

                {/* 메인 메뉴 */}
                  <Link href={item.path} className={`flex items-center pb-5 mt-5 ${
                    activeMenu === idx ? "font-medium text-green-900" : ""}`}>
                    {item.title}
                    {item.subMenus && !menu && (
                      <ChevronDown
                        size={16}
                        className={`ml-0.5 mt-0.5 transition duration-200 ${
                          activeMenu === idx ? "rotate-180" : "rotate-0"}`}
                        aria-hidden="true"
                      />)}
                  </Link>

                {/* 서브 메뉴 리스트 */}
                {activeMenu === idx && item.subMenus && (
                  // {true && item.subMenus && (
                  <ul
                    className="absolute text-[14px] -mt-1 -left-6 border-t-4 border-green-900 divide-y divide-gray-200 bg-white
                    shadow-xl z-10 md:w-auto animate-fade-up">
                    {item.subMenus.map((subItem, subIdx) => (
                      <li key={subIdx} className="whitespace-nowrap hover:bg-gray-100 hover:text-green-900 hover:font-medium">
                        {/* block을 주고 padding을 주면 전체 영역이 선택 가능해짐 */}
                        <Link href={subItem.path} className="block px-5 py-2.5">{subItem.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ######################################### */}
        {/* # MOBILE: 네비게이션 메뉴 (menu 클릭시) # */}
        {/* ######################################### */}
        <div className={`block md:hidden ${menu ? "animate-drop-in mb-2" : ""}`}>
          {menu && (
            // 모바일 네비게이션
            // items-center space-y-6
            <ul className="flex-col justify-between text-[14px] divide-y divide-gray-400 my-2.5 border-t-4 border-green-900">
              {menus.map((item, idx) => (
                <li key={idx} className={`py-3 cursor-pointer px-5`}
                    onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                >

                  {/* 메인 메뉴 */}
                  <div className={`flex justify-between hover:font-bold hover:text-green-900 ${activeMenu === idx ? "font-bold text-green-900" : ""}`}>
                  {item.title}
                  {item.subMenus && (
                    <ChevronDown
                      size={20}
                      className={`ml-1 justify-end transition duration-200 ${
                        activeMenu === idx ? "rotate-180" : "rotate-0"}`}
                      aria-hidden="true"
                    />)}
                  </div>

                  {/* 서브 메뉴 리스트 */}
                  {activeMenu === idx && item.subMenus && (
                    // {true && item.subMenus && (
                    <ul
                      className="justify-between text-[14px] divide-y divide-gray-400 mt-2.5 -mb-2.5 border-t-2 border-green-900 animate-drop-in-25">
                      {item.subMenus.map((subItem, subIdx) => (
                        <li key={subIdx} className="">
                          {/* block을 주면 부모 전체 영역이 선택 가능해짐 */}
                          <Link href={subItem.path} className="block pl-8 py-2.5 hover:font-bold hover:text-green-900 hover:bg-gray-100">{subItem.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}


                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </nav>
  )
}