'use client';

import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-3xl',
        lg: 'text-5xl',
        xl: 'text-7xl',
    };

    return (
        <span
            className={`font-logo text-slate-800 tracking-normal ${sizeClasses[size]} ${className}`}
            style={{ fontFamily: 'var(--font-dancing-script)' }}
        >
            Re:Me
        </span>
    );
}
