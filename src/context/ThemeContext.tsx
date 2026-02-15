'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export type ThemeColor = 'indigo' | 'teal' | 'rose' | 'amber' | 'slate' | 'cyan';

type ThemeContextType = {
    themeColor: ThemeColor;
    gradientClass: string;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: { [key in ThemeColor]: string } = {
    'indigo': 'from-indigo-50 to-white',
    'teal': 'from-teal-50 to-white',
    'rose': 'from-rose-50 to-white',
    'amber': 'from-amber-50 to-white',
    'slate': 'from-slate-100 to-white',
    'cyan': 'from-cyan-50 to-white'
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Random theme on session start / route change
        const colors = Object.keys(themes) as ThemeColor[];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setThemeColor(randomColor);
    }, [pathname]);

    // Always provide context, even during SSR/Hydration
    // We use 'indigo' as the default initial theme to match server output
    return (
        <ThemeContext.Provider value={{ themeColor, gradientClass: themes[themeColor] }}>
            <main className={`min-h-screen bg-gradient-to-b ${themes[themeColor]} transition-colors duration-1000`}>
                {children}
            </main>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
