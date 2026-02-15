'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '@/components/BrandLogo';
import { Moon, Sun } from 'lucide-react';

type PageHeaderProps = {
    title?: string;
    rightElement?: React.ReactNode;
};

export default function PageHeader({ title, rightElement }: PageHeaderProps) {
    const { theme, selectTheme, themeColor, isDarkMode, toggleDarkMode } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const themeOptions = [
        { id: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
        { id: 'teal', label: 'Teal', color: 'bg-teal-500' },
        { id: 'rose', label: 'Rose', color: 'bg-rose-500' },
        { id: 'amber', label: 'Amber', color: 'bg-amber-500' },
        { id: 'slate', label: 'Slate', color: 'bg-slate-500' },
        { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
        { id: 'sakura', label: 'Sakura', color: 'bg-pink-400' },
        { id: 'fresh_green', label: 'Fresh Green', color: 'bg-emerald-500' },
        { id: 'autumn', label: 'Autumn', color: 'bg-orange-600' },
        { id: 'snow', label: 'Snow', color: 'bg-sky-300' },
    ] as const;

    return (
        <header className="p-4 flex items-center justify-between glass sticky top-0 z-10 border-x-0 border-t-0 rounded-none relative">
            {title ? (
                <h1 className="text-xl font-heading font-bold tracking-tight" style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}>{title}</h1>
            ) : (
                <div className="flex items-center gap-2">
                    <BrandLogo size="sm" className="mt-1" />
                </div>
            )}

            <div className="flex items-center gap-3">
                {rightElement}

                <div className="relative flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-amber-300' : 'bg-white/50 text-slate-500 hover:bg-slate-100'}`}
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        onClick={toggleMenu}
                        className={`w-8 h-8 rounded-full ${theme.avatarBg} flex items-center justify-center ${theme.avatarText} font-bold text-xs ring-2 ring-white shadow-sm transition-colors duration-500 cursor-pointer hover:opacity-80 active:scale-95`}
                    >
                        M
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 top-10 w-48 bg-white/90 glass-card rounded-xl p-2 shadow-xl z-50 flex flex-col gap-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Select Theme</p>
                                <div className="grid grid-cols-4 gap-2 p-1">
                                    {themeOptions.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                selectTheme(t.id);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-8 h-8 rounded-full ${t.color} shadow-sm border-2 transition-transform hover:scale-110 active:scale-95 ${themeColor === t.id ? 'border-slate-600 ring-2 ring-white' : 'border-transparent'}`}
                                            title={t.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
