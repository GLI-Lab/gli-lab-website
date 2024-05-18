"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';


export function Breadcrumb() {
  // URL이 "/hello/test"라면, segments 배열은 ["hello", "test"]
  const segments = usePathname().split('/').filter(Boolean); // 빈 문자열 제거
  const links = [
    {name: 'Home', path: '/'}, // 항상 포함
  ];
  const mapping: { [key: string]: string } = {
    'topic': 'Research Topic',
  }

  // 동적으로 경로와 이름 매핑
  segments.forEach((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    segment = mapping[segment] || segment  // undefined 대응
    let name = segment.charAt(0).toUpperCase() + segment.slice(1); // 첫번째 문자 대문자
    links.push({name, path});
  });

  return (
      <div>
        {links.map((link, index) => (
            <span key={index}>
          {index === segments.length ? (
              <span className="tracking-tight text-green-900 font-semibold">{link.name}</span>
          ) : (
              <Link href={link.path} className="tracking-tight">{link.name}</Link>
          )}
              {index < links.length - 1 ? ' > ' : ''}
        </span>
        ))}
      </div>
  );
}