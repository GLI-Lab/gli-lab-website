"use client"  // useStatus 때문에

import Image from 'next/image'
import Link from "next/link"
import { useState, useEffect } from "react"

import { IoChevronDown } from "react-icons/io5";

interface SubMenu {
    title: string;
    path: string;
}

interface Menu {
    title: string;
    path: string;
    subMenus?: SubMenu[];
}

export default function Header() {
    const [menu, setMenu] = useState (false)
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Detect touch device
    useEffect(() => {
        const checkTouchDevice = () => {
            setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        checkTouchDevice();
    }, []);

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

    // Close submenu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('li.relative')) {
                setActiveMenu(null);
            }
        };

        if (activeMenu !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [activeMenu]);

    // Helper function to check if URL is external
    const isExternalUrl = (url: string) => {
        return url.startsWith('http://') || url.startsWith('https://');
    };

    // Menu list (w/ submenu)
    const menus: Menu[] = [
        {
            title: "Home",
            path: "/",
        },
        {
            title: "People",
            path: "/people/members",
            subMenus: [
                {title: "Professor", path: "https://bkoh509.github.io"},
                {title: "Members", path: "/people/members"},
                {title: "Alumni", path: "/people/alumni"}
            ]
        },
        {
            title: "Research",
            path: "/research/topics",
            subMenus: [
                {title: "Research Topics", path: "/research/topics"},
                {title: "Projects", path: "/research/projects"}
            ]
        },
        {
            title: "Publications",
            path: "/publications/papers",
            subMenus: [
                {title: "Papers", path: "/publications/papers"},
                {title: "Patents", path: "/publications/patents"},
                // {title: "Patents", path: "https://bkoh509.github.io"},
            ]
        },
        {
            title: "Board",
            path: "/board/gallery",
            subMenus: [
                {title: "News", path: "/board/news"},
                {title: "Seminar", path: "/board/seminar"},
                {title: "Gallery", path: "/board/gallery"},
                {title: "Study", path: "/board/study"},
                {title: "Lectures", path: "/board/lectures"},
                {title: "Resources", path: "/board/resources"}
            ]
        },
        {
            title: "Contact",
            path: "/contact",
        },
    ];

    return (
        // fixed top-0: 항상 상단에 고정
        <nav className="z-50">
            <div className={`fixed top-0 ${isScrolled ? "bg-[#f4f4f4] shadow-xl" : (menu ? "bg-white shadow-xl md:shadow-none" : "bg-white")} w-full border-b md:border-b-1`}>
                <div className="max-w-screen-xl items-center mx-auto md:flex px-4">

                    {/* ##################################################### */}
                    {/* # 네비게이션 로고/텍스트 + 네비게이션 햄버거 아이콘 # */}
                    {/* ##################################################### */}
                    <div className={`flex items-center justify-between ${isScrolled ? "py-1" : "py-2"}`}>
                        <Link href="/" className="items-center flex min-w-[250px]">
                            <div className={`transition-all duration-200 ${isScrolled ? "h-[50px] w-[50px]" : "h-[60px] w-[60px] lg:h-[70px] lg:w-[70px]"}`}>
                                <Image src={`${isScrolled ? "/images/logo/GLI_logo_black.png" : "/images/logo/GLI_logo_green.png"}`} alt="logo" width="96" height="96"/>
                            </div>
                            <div className={`-space-y-2 ml-3 tracking-tighter ${isScrolled ? "text-[20px]" : "text-[21px] lg:text-[23.5px]"}`}>
                                <p>Graph & Language</p>
                                <p>Intelligence Lab.</p>
                            </div>
                        </Link>
                        <div className="md:hidden">
                            <button className="pr-2 pt-3" onClick={() => setMenu(!menu)}>
                                <div className="w-8 h-8 flex flex-col justify-center items-center">
                                    <div className="w-6 h-0.5 bg-black transition-all duration-100 ease-out mb-1"
                                         style={{
                                             transform: menu ? 'rotate(45deg) translate(0, 0.5rem) scale(1.1)' : 'rotate(0) scale(1)',
                                             transformOrigin: 'center',
                                         }}>
                                    </div>
                                    <div className="w-6 h-0.5 bg-black transition-all duration-300 ease-in-out mb-1"
                                         style={{
                                             opacity: menu ? 0 : 1,
                                             transform: menu ? 'scale(0.3)' : 'scale(1)',
                                         }}>
                                    </div>
                                    <div className="w-6 h-0.5 bg-black transition-all duration-500 ease-out"
                                         style={{
                                             transform: menu ? 'rotate(-45deg) translate(0, -0.5rem) scale(1.1)' : 'rotate(0) scale(1)',
                                             transformOrigin: 'center',
                                         }}>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* ############################################## */}
                    {/* # DESKTOP: 네비게이션 메뉴 (hidden md:block) # */}
                    {/* ############################################## */}
                    <div className="hidden md:block flex-1">
                        <ul className="justify-end items-center md:flex md:space-x-4 1.5md:space-x-8 lg:space-x-10 xl:space-x-12">
                            {menus.map((item, idx) => (
                                <li key={idx} className="relative "           // 서브메뉴 리스트 선택할 수 있게
                                    onMouseEnter={() => !isTouchDevice && setActiveMenu(idx)}   // 호버 시 서브메뉴 활성화 (터치 디바이스 제외)
                                    onMouseLeave={() => !isTouchDevice && setActiveMenu(null)}  // 호버 해제 시 서브메뉴 비활성화 (터치 디바이스 제외)
                                >

                                    {/* 메인 메뉴 */}
                                    {item.subMenus ? (
                                        <div 
                                            className={`flex tracking-tight items-center transition-all duration-200 pb-5 mt-5 cursor-pointer ${
                                                activeMenu === idx ? "text-green-900" : ""}
                                                ${isScrolled ? "text-[16.5px]" : "text-[16.5px] 1.5md:text-[17px] lg:text-[18px]"} `}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveMenu(activeMenu === idx ? null : idx);
                                            }}
                                        >
                                            {item.title}
                                            <IoChevronDown
                                                size={16}
                                                className={`ml-0.5 mt-0.5 transition duration-200 ${
                                                    activeMenu === idx ? "rotate-180" : "rotate-0"}`}
                                            />
                                        </div>
                                    ) : (
                                        <Link href={item.path}
                                              {...(isExternalUrl(item.path) && {target: "_blank", rel: "noopener noreferrer"})}
                                              className={`flex tracking-tight items-center transition-all duration-200 pb-5 mt-5 ${
                                                  activeMenu === idx ? "text-green-900" : ""}
                                                  ${isScrolled ? "text-[16.5px]" : "text-[16.5px] 1.5md:text-[17px] lg:text-[18px]"} `}>
                                            {item.title}
                                        </Link>
                                    )}

                                    {/* 서브 메뉴 리스트 */}
                                    {activeMenu === idx && item.subMenus && (
                                        <ul className={`absolute animate-fade-up w-auto min-w-[140px] lg:min-w-[160px] -mt-1 
                                                        ${idx == menus.length - 1 ? "-left-24" : "-left-6"}
                                                        border-t-4 border-green-900 divide-y divide-gray-200 shadow-xl z-10
                                                        tracking-tight ${isScrolled ? "bg-[#f4f4f4] text-[15.5px]" : "bg-white text-[16px] lg:text-[17px]"}`}>
                                            {item.subMenus.map((subItem, subIdx) => (
                                                <li key={subIdx}
                                                    className="whitespace-nowrap hover:bg-gray-100 hover:text-green-900">
                                                    <Link
                                                        href={subItem.path}
                                                        {...(isExternalUrl(subItem.path) && { 
                                                          target: "_blank", 
                                                          rel: "noopener noreferrer" 
                                                        })}
                                                        className="block px-5 py-3 pr-10"
                                                        onClick={() => setActiveMenu(null)}
                                                    >
                                                        <span className="flex items-center">
                                                            {subItem.title}
                                                            {isExternalUrl(subItem.path) && (
                                                                <svg 
                                                                    className="ml-1.5 w-4 h-4 inline-block" 
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round" 
                                                                        strokeWidth={2} 
                                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                                                    />
                                                                </svg>
                                                            )}
                                                        </span>
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
                    {/* # MOBILE: 네비게이션 메뉴 (menu 클릭시)    # */}
                    {/* ######################################### */}
                    <div className={`block md:hidden text-[15.5px] ${menu ? "animate-drop-in mb-2" : ""}`}>
                        {menu && (
                            // 모바일 네비게이션
                            // items-center space-y-6
                            <ul
                                className="flex-col justify-between divide-y divide-gray-400 border-t-2 border-green-900">
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
                                                {...(isExternalUrl(item.path) && { 
                                                  target: "_blank", 
                                                  rel: "noopener noreferrer" 
                                                })}
                                                className={`flex justify-between hover:font-semibold hover:text-green-900 ${activeMenu === idx ? "font-semibold text-green-900" : ""}`}
                                                onClick={() => setMenu(false)}
                                            >
                                                {item.title}
                                            </Link>
                                        )}

                                        {/* 서브 메뉴 리스트 (실제 이동) */}
                                        {activeMenu === idx && item.subMenus && (
                                            <ul className="justify-between divide-y divide-gray-400 mt-2.5 -mb-2.5 border-t-2 border-green-900 animate-drop-in-25">
                                                {item.subMenus.map((subItem, subIdx) => (
                                                    <li key={subIdx} className="">
                                                        <Link
                                                            href={subItem.path}
                                                            {...(isExternalUrl(subItem.path) && {target: "_blank", rel: "noopener noreferrer"})}
                                                            className="block pl-8 py-2.5 hover:font-semibold hover:text-green-900 hover:bg-gray-100"
                                                            onClick={() => setMenu(false)}
                                                        >
                                                            <span className="flex items-center">
                                                                {subItem.title}
                                                                {isExternalUrl(subItem.path) && (
                                                                    <svg 
                                                                        className="ml-1.5 w-4 h-4 inline-block" 
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        viewBox="0 0 24 24"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <path 
                                                                            strokeLinecap="round" 
                                                                            strokeLinejoin="round" 
                                                                            strokeWidth={2} 
                                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </span>
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
            <div className={`transition-all duration-300 ${isScrolled ? "h-[74px]" : "h-[76px] lg:h-[86px]"}`}></div>
        </nav>
)
}