'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor =
    | 'indigo' | 'teal' | 'rose' | 'amber' | 'slate' | 'cyan'
    | 'midnight' | 'sakura' | 'fresh_green' | 'autumn' | 'snow';

export type ThemeDef = {
    id: ThemeColor;
    name: string;
    gradient: string;
    text: string;      // Accent color for headers/icons
    textMain: string;  // Body text color
    bg: string;        // Component background color
    avatarBg: string;
    avatarText: string;
    metaColor: string; // For browser status bar
};

type ThemeContextType = {
    themeColor: ThemeColor;
    theme: ThemeDef;
    selectTheme: (color: ThemeColor) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeConfig: Record<ThemeColor, ThemeDef> = {
    'indigo': { id: 'indigo', name: 'Indigo', gradient: 'from-indigo-50 to-white', text: 'text-indigo-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-600', metaColor: '#eef2ff' },
    'teal': { id: 'teal', name: 'Teal', gradient: 'from-teal-50 to-white', text: 'text-teal-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-teal-100', avatarText: 'text-teal-600', metaColor: '#f0fdfa' },
    'rose': { id: 'rose', name: 'Rose', gradient: 'from-rose-50 to-white', text: 'text-rose-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-rose-100', avatarText: 'text-rose-600', metaColor: '#fff1f2' },
    'amber': { id: 'amber', name: 'Amber', gradient: 'from-amber-50 to-white', text: 'text-amber-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-amber-100', avatarText: 'text-amber-600', metaColor: '#fffbeb' },
    'slate': { id: 'slate', name: 'Slate', gradient: 'from-slate-100 to-white', text: 'text-slate-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-slate-200', avatarText: 'text-slate-600', metaColor: '#f1f5f9' },
    'cyan': { id: 'cyan', name: 'Cyan', gradient: 'from-cyan-50 to-white', text: 'text-cyan-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-cyan-100', avatarText: 'text-cyan-600', metaColor: '#ecfeff' },

    // New Themes
    'midnight': { id: 'midnight', name: 'Midnight', gradient: 'from-slate-900 via-slate-900 to-slate-800', text: 'text-amber-200', textMain: 'text-amber-50', bg: 'bg-slate-800/80', avatarBg: 'bg-amber-900', avatarText: 'text-amber-100', metaColor: '#0f172a' },
    'sakura': { id: 'sakura', name: 'Sakura', gradient: 'from-pink-100 via-white to-white', text: 'text-pink-500', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-pink-100', avatarText: 'text-pink-600', metaColor: '#fce7f3' },
    'fresh_green': { id: 'fresh_green', name: 'Fresh Green', gradient: 'from-emerald-50 to-white', text: 'text-emerald-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-emerald-100', avatarText: 'text-emerald-600', metaColor: '#ecfdf5' },
    'autumn': { id: 'autumn', name: 'Autumn', gradient: 'from-orange-50 to-white', text: 'text-orange-700', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-orange-100', avatarText: 'text-orange-800', metaColor: '#fff7ed' },
    'snow': { id: 'snow', name: 'Snow', gradient: 'from-sky-50 to-white', text: 'text-sky-600', textMain: 'text-slate-900', bg: 'bg-white', avatarBg: 'bg-sky-100', avatarText: 'text-sky-600', metaColor: '#f0f9ff' },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('reme_theme') as ThemeColor;
        const savedDark = localStorage.getItem('reme_dark_mode') === 'true';

        if (savedTheme && themeConfig[savedTheme]) {
            setThemeColor(savedTheme);
        } else {
            const basicColors: ThemeColor[] = ['indigo', 'teal', 'rose', 'amber', 'slate', 'cyan'];
            const randomColor = basicColors[Math.floor(Math.random() * basicColors.length)];
            setThemeColor(randomColor);
        }

        setIsDarkMode(savedDark);
    }, []);

    const selectTheme = (color: ThemeColor) => {
        setThemeColor(color);
        localStorage.setItem('reme_theme', color);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('reme_dark_mode', String(next));
            return next;
        });
    };

    // Base theme
    const baseTheme = themeConfig[themeColor];

    // computed theme based on dark mode
    const currentTheme: ThemeDef = {
        ...baseTheme,
        id: isDarkMode ? 'midnight' : baseTheme.id,
        gradient: isDarkMode ? 'from-slate-950 via-slate-900 to-slate-900' : baseTheme.gradient,
        bg: isDarkMode ? 'glass-card-dark' : baseTheme.bg,
        textMain: isDarkMode ? 'text-slate-200' : baseTheme.textMain,
        metaColor: isDarkMode ? '#020617' : baseTheme.metaColor
    };

    // Update browser status bar color
    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', currentTheme.metaColor);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = currentTheme.metaColor;
            document.head.appendChild(meta);
        }
    }, [currentTheme.metaColor]);

    return (
        <ThemeContext.Provider value={{ themeColor, theme: currentTheme, selectTheme, isDarkMode, toggleDarkMode }}>
            <main className={`min-h-screen bg-gradient-to-b ${currentTheme.gradient} ${currentTheme.textMain} transition-colors duration-1000`}>
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
