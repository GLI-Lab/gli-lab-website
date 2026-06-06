"use client"

import React from 'react';
import Link from 'next/link';

interface ProfileDetailSectionLinkProps {
    href: string;
    children: React.ReactNode;
    title?: string;
}

export function ProfileDetailSectionLink({ href, children, title }: ProfileDetailSectionLinkProps) {
    return (
        <span className="text-text-accent font-medium">
            <Link
                href={href}
                className="group hover:text-brand-primary hover:underline underline-offset-4 hover:decoration-1.5"
                title={title}
            >
                {children}
                <svg
                    className="w-[0.85em] h-[0.85em] ml-1 mb-0.5 inline opacity-100 group-hover:opacity-100"
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
            </Link>
        </span>
    );
}
