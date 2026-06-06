import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const GLI_LOGO = "/images/logo/GLI_opengraph_2000x1050-trim.jpg";
const KONKUK_LOGO = "/images/logo/Konkuk Logo_new.jpg";

interface FooterLink {
    title: string;
    path: string;
}

const FOOTER_EXTERNAL_LINKS: FooterLink[] = [
    { title: "Konkuk University", path: "https://www.konkuk.ac.kr/konkuk/index.do" },
    { title: "Computer Science & Engineering", path: "https://cse.konkuk.ac.kr/cse/index.do" },
    { title: "GitHub", path: "https://github.com/GLI-Lab/GLI-Lab" },
    { title: "bkoh@konkuk.ac.kr", path: "mailto:bkoh@konkuk.ac.kr" },
];

interface FooterMenu {
    title: string;
    path: string;
    links: FooterLink[];
}

const FOOTER_MENUS: FooterMenu[] = [
    {
        title: "People",
        path: "/people/members",
        links: [
            { title: "Professor", path: "https://bkoh509.github.io" },
            { title: "Members", path: "/people/members" },
            { title: "Alumni", path: "/people/alumni" },
        ],
    },
    {
        title: "Research",
        path: "/research/topics",
        links: [
            { title: "Vision and Topics", path: "/research/topics" },
            { title: "Projects", path: "/research/projects" },
        ],
    },
    {
        title: "Publications",
        path: "/publications/papers",
        links: [
            { title: "Papers", path: "/publications/papers" },
            { title: "Patents", path: "/publications/patents" },
        ],
    },
    {
        title: "Board",
        path: "/board/news",
        links: [
            { title: "News", path: "/board/news" },
            { title: "Seminar", path: "/board/seminar" },
            { title: "Gallery", path: "/board/gallery" },
            { title: "Study", path: "/board/study" },
            { title: "Lectures", path: "/board/lectures" },
            { title: "Resources", path: "/board/resources" },
        ],
    },
    {
        title: "Contact",
        path: "/contact/information",
        links: [
            { title: "Hiring (Q&A)", path: "/contact/hiring" },
            { title: "Email & Location", path: "/contact/information" },
        ],
    },
];

const MOBILE_TOP_LINKS: FooterLink[] = FOOTER_MENUS.map(({ title, path }) => ({ title, path }));

const FOOTER_DIVIDER_H = "h-px w-full bg-white/25 shrink-0";

function isExternalUrl(url: string) {
    return url.startsWith("http://") || url.startsWith("https://");
}

function ExternalLinkIcon() {
    return (
        <svg
            className="w-3 h-3 shrink-0 opacity-70"
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
    );
}

function FooterNavLink({
    href,
    children,
    className = "text-white/75 hover:text-white hover:underline underline-offset-4 transition-colors",
    showExternalIcon = true,
}: {
    href: string;
    children: ReactNode;
    className?: string;
    showExternalIcon?: boolean;
}) {
    const external = isExternalUrl(href);

    return (
        <Link
            href={href}
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
            className={`inline-flex items-center gap-1 ${className}`}
        >
            {children}
            {external && showExternalIcon && <ExternalLinkIcon />}
        </Link>
    );
}

function FooterLogos({ logoClassName }: { logoClassName: string }) {
    return (
        <div className="flex flex-col gap-2 select-none shrink-0">
            <Link
                href="/"
                className="inline-block opacity-90 hover:opacity-100 transition-opacity duration-200"
                aria-label="Graph & Language Intelligence Lab home"
                draggable={false}
            >
                <Image
                    src={GLI_LOGO}
                    alt="Graph & Language Intelligence Lab"
                    width={1919}
                    height={804}
                    draggable={false}
                    className={`${logoClassName} rounded-sm`}
                />
            </Link>

            <Link
                href="https://www.konkuk.ac.kr/konkuk/index.do"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block opacity-90 hover:opacity-100 transition-opacity duration-200"
                aria-label="Konkuk University website"
                draggable={false}
            >
                <Image
                    src={KONKUK_LOGO}
                    alt="Konkuk University"
                    width={942}
                    height={338}
                    draggable={false}
                    className={`${logoClassName} rounded-sm`}
                />
            </Link>
        </div>
    );
}

function FooterExternalLinks({ className }: { className?: string }) {
    return (
        <ul className={`flex flex-col gap-1.5 min-w-0 ${className ?? ""}`}>
            {FOOTER_EXTERNAL_LINKS.map((link) => (
                <li key={link.path}>
                    <FooterNavLink
                        href={link.path}
                        className="text-white/75 hover:text-white hover:underline underline-offset-4 transition-colors text-left leading-snug"
                    >
                        {link.title}
                    </FooterNavLink>
                </li>
            ))}
        </ul>
    );
}

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#343539] text-[13px] md:text-[14px] lg:text-[15px]">
            <div className="max-w-screen-xl px-4 md:px-10 mx-auto">
                <div className="pt-6 md:pt-8 pb-4 md:pb-6">
                    {/* Mobile */}
                    <div className="md:hidden space-y-4">
                        <div className="flex flex-row items-start gap-3 sm:gap-4">
                            <FooterLogos logoClassName="h-9 w-auto sm:h-10" />
                            <FooterExternalLinks className="flex-1 pt-0.5" />
                        </div>

                        <div aria-hidden="true" className={FOOTER_DIVIDER_H} />

                        <nav
                            aria-label="Footer navigation"
                            className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-left"
                        >
                            {MOBILE_TOP_LINKS.map((link) => (
                                <FooterNavLink
                                    key={link.path}
                                    href={link.path}
                                    showExternalIcon={false}
                                    className="font-medium text-white/85 hover:text-white hover:underline underline-offset-4 transition-colors"
                                >
                                    {link.title}
                                </FooterNavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Tablet & Desktop */}
                    <div className="hidden md:flex flex-col lg:flex-row lg:items-stretch">
                        <div className="flex flex-col items-start shrink-0 lg:pr-8 xl:pr-10">
                            <div className="flex flex-row items-center gap-4 md:gap-5 select-none">
                                <Link
                                    href="/"
                                    className="inline-block opacity-90 hover:opacity-100 transition-opacity duration-200"
                                    aria-label="Graph & Language Intelligence Lab home"
                                    draggable={false}
                                >
                                    <Image
                                        src={GLI_LOGO}
                                        alt="Graph & Language Intelligence Lab"
                                        width={1919}
                                        height={804}
                                        draggable={false}
                                        className="h-12 md:h-16 w-auto rounded-sm select-none"
                                    />
                                </Link>

                                <Link
                                    href="https://www.konkuk.ac.kr/konkuk/index.do"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block opacity-90 hover:opacity-100 transition-opacity duration-200"
                                    aria-label="Konkuk University website"
                                    draggable={false}
                                >
                                    <Image
                                        src={KONKUK_LOGO}
                                        alt="Konkuk University"
                                        width={942}
                                        height={338}
                                        draggable={false}
                                        className="h-12 md:h-16 w-auto rounded-sm select-none"
                                    />
                                </Link>
                            </div>

                            <FooterExternalLinks className="mt-3 md:mt-4 items-start" />
                        </div>

                        <div
                            aria-hidden="true"
                            className={`my-6 lg:my-0 lg:mx-6 xl:mx-8 lg:h-auto lg:w-px lg:self-stretch ${FOOTER_DIVIDER_H}`}
                        />

                        <nav
                            aria-label="Footer navigation"
                            className="grid grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 text-left w-full lg:flex-1 lg:max-w-3xl min-w-0"
                        >
                            {FOOTER_MENUS.map((menu) => (
                                <div key={menu.title}>
                                    <FooterNavLink href={menu.path} showExternalIcon={false}>
                                        <p className="font-semibold text-white mb-2.5">{menu.title}</p>
                                    </FooterNavLink>
                                    <ul className="space-y-1.5">
                                        {menu.links.map((link) => (
                                            <li key={link.path}>
                                                <FooterNavLink href={link.path}>{link.title}</FooterNavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                <div aria-hidden="true" className={FOOTER_DIVIDER_H} />

                <div className="pt-3 md:pt-4 pb-5 md:pb-6 text-center text-white/85">
                    <p>
                        <span className="block w-full md:w-auto md:inline">Copyright © {currentYear}</span>
                        <Link className="hover:text-white hover:underline underline-offset-4 font-semibold" href="/">
                            <span> Graph & Language Intelligence Lab. </span>
                        </Link>
                        <span className="block w-full md:w-auto md:inline">All Rights Reserved.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
