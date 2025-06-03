"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface BreadcrumbLink {
    name: string;
    path: string;
}

export function Breadcrumb() {
    // URL이 "/hello/test"라면, segments 배열은 ["hello", "test"]
    const segments = usePathname().split('/').filter(Boolean); // 빈 문자열 제거
    const links: BreadcrumbLink[] = [
        {name: 'Home', path: '/'}, // 항상 포함
    ];
    
    const mapping: { [key: string]: string } = {
        'topic': 'Research Topic',
    }

    // 동적으로 경로와 이름 매핑
    segments.forEach((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const mappedSegment = mapping[segment] || segment; // undefined 대응
        const name = mappedSegment.charAt(0).toUpperCase() + mappedSegment.slice(1); // 첫번째 문자 대문자
        links.push({name, path});
    });

    return (
        <nav aria-label="Breadcrumb">
            <div>
                {links.map((link, index) => (
                    <span key={index}>
                        {index === links.length - 1 ? (
                            <span className="tracking-tight font-semibold" aria-current="page">
                                {link.name}
                            </span>
                            ) : (
                            <Link href={link.path} className="tracking-tight hover:underline">
                                {link.name}
                            </Link>
                            )}
                        {index < links.length - 1 ? ' > ' : ''}
                    </span>
                ))}
            </div>
        </nav>
    );
}