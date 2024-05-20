"use client"  // useStatus 때문에

import Image from 'next/image'
import Link from "next/link"
import { useState, useEffect } from "react"

import { IoChevronDown, IoMenuOutline } from "react-icons/io5";


export default function Header() {
    const [menu, setMenu] = useState (false)
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // To resize header
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Menu list (w/ submenu)
    const menus = [
        {
            title: "About",
            path: "/about/introduction",
            subMenus: [
                {title: "Introduction", path: "/about/introduction"},
                {title: "Contact", path: "/about/contact"},
                {title: "Opening", path: "/about/opening"}
            ]
        },
        {
            title: "People",
            path: "/people/members",
            subMenus: [
                {title: "Members", path: "/people/members"},
                {title: "Professor", path: "/people/professor"}
            ]
        },
        {
            title: "Research",
            path: "/research/topic",
            subMenus: [
                {title: "Research Topic", path: "/research/topic"},
                {title: "Project", path: "/research/project"}
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
                {title: "News", path: "/board/news"},
                {title: "Gallery", path: "/board/gallery"},
                {title: "Teaching", path: "/board/teaching"},
                {title: "Resources", path: "/board/resources"},
            ]
        },
    ];

    return (
        // fixed top-0: 항상 상단에 고정
        <nav className={`z-40`}>
            <div className={`fixed top-0 ${isScrolled ? "bg-[#f4f4f4] shadow-md" : "bg-white shadow-sm"} w-full border-b md:border-b-1`}>
                <div className="max-w-screen-xl items-center mx-auto md:flex px-6">

                    {/* ##################################################### */}
                    {/* # 네비게이션 로고/텍스트 + 네비게이션 햄버거 아이콘 # */}
                    {/* ##################################################### */}
                    <div className={`flex items-center justify-between ${isScrolled ? "py-1" : "py-2"}`}>
                        <Link href="/" className="items-center flex min-w-[270px]">
                            <div className={`transition-all duration-200 ${isScrolled ? "h-[50px] w-[50px]" : "h-[70px] w-[70px]"}`}>
                                <Image src={`${isScrolled ? "/GLI_logo_black.png" : "/GLI_logo_green.png"}`} alt="logo" width="96" height="96"/>
                            </div>
                            <div className={`-space-y-2 ml-3 tracking-tighter ${isScrolled ? "text-[20px]" : "text-[22px] lg:text-[23.5px]"}`}>
                                <p>Graph & Language</p>
                                <p>Intelligence Lab.</p>
                            </div>
                        </Link>
                        <div className="md:hidden">
                            <button className="pr-2 pt-3" onClick={() => setMenu(!menu)}>
                                <IoMenuOutline  className="h-8 w-8"/>
                            </button>
                        </div>
                    </div>

                    {/* ############################################## */}
                    {/* # DESKTOP: 네비게이션 메뉴 (hidden md:block) # */}
                    {/* ############################################## */}
                    <div className="hidden md:block flex-1">
                        <ul className="justify-end items-center md:flex
                                       md:space-x-6 lg:space-x-10 xl:space-x-12">
                            {menus.map((item, idx) => (
                                <li key={idx} className="relative "  // 서브메뉴 리스트 선택할 수 있게
                                    onMouseEnter={() => setActiveMenu(idx)}  // 호버 시 서브메뉴 활성화
                                    onMouseLeave={() => setActiveMenu(null)}  // 호버 해제 시 서브메뉴 비활성화
                                >

                                    {/* 메인 메뉴 */}
                                    <Link href={item.path}
                                          className={`flex tracking-tight items-center transition-all duration-200 pb-5 mt-5 ${
                                              activeMenu === idx ? "text-green-900" : ""}
                                              ${isScrolled ? "text-[16px]" : "text-[16.5px] lg:text-[17.5px]"} `}>
                                        {item.title}
                                        {item.subMenus && !menu && (
                                            <IoChevronDown
                                                size={16}
                                                className={`ml-0.5 mt-0.5 transition duration-200 ${
                                                    activeMenu === idx ? "rotate-180" : "rotate-0"}`}
                                            />)}
                                    </Link>

                                    {/* 서브 메뉴 리스트 */}
                                    {activeMenu === idx && item.subMenus && (  // {true && item.subMenus && (
                                        <ul className={`absolute animate-fade-up w-[140px] lg:w-[160px] -mt-1 
                                                        ${idx == menus.length - 1 ? "-left-24" : "-left-6"}
                                                        border-t-4 border-green-900 divide-y divide-gray-200  shadow-xl z-10
                                                        tracking-tight ${isScrolled ? "bg-[#f4f4f4] text-[15px]" : "bg-white text-[15.5px] lg:text-[16.5px]"}`}>
                                            {item.subMenus.map((subItem, subIdx) => (
                                                <li key={subIdx}
                                                    className="whitespace-nowrap hover:bg-gray-100 hover:text-green-900">
                                                    <Link  // block을 주고 padding을 주면 전체 영역이 선택 가능해짐
                                                        href={subItem.path} className="block px-5 py-3"
                                                        onClick={() => setActiveMenu(null)}  // 다른 페이지로 이동할 때 서브메뉴 초기화
                                                    >
                                                        {subItem.title}
                                                    </Link>
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
                    <div className={`block md:hidden text-[15.5px] ${menu ? "animate-drop-in mb-2" : ""}`}>
                        {menu && (
                            // 모바일 네비게이션
                            // items-center space-y-6
                            <ul
                                className="flex-col justify-between divide-y divide-gray-400 my-1.5 border-t-4 border-green-900">
                                {menus.map((item, idx) => (
                                    <li key={idx} className={`py-3 cursor-pointer px-5`}
                                        onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                                    >

                                        {/* 메인 메뉴 */}
                                        {item.subMenus ? (
                                            <div
                                                className={`flex justify-between hover:font-semibold hover:text-green-900 ${activeMenu === idx ? "font-semibold text-green-900" : ""}`}>
                                                {item.title}
                                                <IoChevronDown
                                                    size={18}
                                                    className={`ml-1 justify-end transition duration-200 ${
                                                        activeMenu === idx ? "rotate-180" : "rotate-0"}`}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.path}
                                                className={`flex justify-between hover:font-semibold hover:text-green-900 ${activeMenu === idx ? "font-semibold text-green-900" : ""}`}
                                                onClick={() => setMenu(false)}
                                            >
                                                {item.title}
                                            </Link>
                                        )}

                                        {/* 서브 메뉴 리스트 (실제 이동) */}
                                        {activeMenu === idx && item.subMenus && (
                                            // {true && item.subMenus && (
                                            <ul
                                                className="justify-between divide-y divide-gray-400 mt-2.5 -mb-2.5 border-t-2 border-green-900 animate-drop-in-25">
                                                {item.subMenus.map((subItem, subIdx) => (
                                                    <li key={subIdx} className="">
                                                        {/* block을 주면 부모 전체 영역이 선택 가능해짐 */}
                                                        <Link
                                                            href={subItem.path}
                                                            className="block pl-8 py-2.5 hover:font-semibold hover:text-green-900 hover:bg-gray-100"
                                                            onClick={() => setMenu(false)}
                                                        >
                                                            {subItem.title}
                                                        </Link>
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
            </div>
            <div className={`transition-all duration-300 ${isScrolled ? "h-[70px]" : "h-[86px]"}`}></div>
        </nav>
)
}