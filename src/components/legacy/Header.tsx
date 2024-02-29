"use client"

import Image from 'next/image'
import * as React from "react"
import Link from "next/link"
import {Menu} from "lucide-react"

export default function Header() {
  const [state, setState] = React.useState(false)

  const menus = [
    {title: "About", path: "/about"},
    {title: "Members", path: "/menbers"},
    {title: "Research", path: "/research"},
    {title: "Publications", path: "/publications"},
    {title: "Lectures", path: "/lectures"},
  ]

  return (
    <nav className="bg-white w-full border-b md:border-b-1">
      <div className="items-center px-4 max-w-screen-xl mx-auto md:flex md:px-6">
        <div className="flex items-center justify-between py-3 min-w-[320px] md:py-3 md:block">

          {/* 네비게이션 로고 */}
          <Link href="/public" className="items-center flex">
            <div className="h-16 w-16 md:h-20 md:w-20">
              <Image src="/GLI_spare_v2 Black Logo.png" alt="logo" width="96" height="96" layout="intrinsic" />
            </div>
            <div className="-space-y-1 ml-3 text-xl md:text-2xl py-1">
              <p>Graph & Language</p>
              <p>Intelligence Lab.</p>
            </div>
          </Link>

          {/* 네비게이션 햄버거 아이콘 */}
          <div className="md:hidden">
            <button
              className="text-gray-700 outline-none p-2 rounded-md focus:border-gray-400 focus:border"
              onClick={() => setState(!state)}
            >
              <Menu/>
            </button>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <div className={`flex-1 justify-self-center pb-3 mt-2 md:block md:pb-0 md:mt-0 ${
          state ? "animate-fadeIn" : "hidden"}`}>
          <ul className="justify-end items-center space-y-6 md:flex md:space-x-4 md:space-y-0 lg:space-x-10">
            {menus.map((item, idx) => (
              <li key={idx} className="text-gray-600 hover:text-green-800 hover:font-bold">
                <Link href={item.path}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}