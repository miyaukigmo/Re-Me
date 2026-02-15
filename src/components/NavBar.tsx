'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, BookOpen, BarChart2, Home } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function NavBar() {
    const pathname = usePathname();

    const { themeColor } = useTheme();
    const isActive = (path: string) => pathname === path;

    const getActiveColor = () => {
        switch (themeColor) {
            case 'teal': return 'text-teal-600';
            case 'rose': return 'text-rose-600';
            case 'amber': return 'text-amber-600';
            case 'cyan': return 'text-cyan-600';
            case 'slate': return 'text-slate-600';
            default: return 'text-indigo-600';
        }
    };

    const activeClass = getActiveColor();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex text-[10px] font-medium text-slate-400 z-50 pb-safe">
            <Link href="/" className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/') ? activeClass : 'hover:text-slate-600'}`}>
                <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className={isActive('/') ? 'font-semibold' : ''}>ホーム</span>
            </Link>
            <Link href="/book" className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/book') ? activeClass : 'hover:text-slate-600'}`}>
                <BookOpen size={24} strokeWidth={isActive('/book') ? 2.5 : 2} />
                <span className={isActive('/book') ? 'font-semibold' : ''}>読書ノート</span>
            </Link>
            <Link href="/stats" className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/stats') ? activeClass : 'hover:text-slate-600'}`}>
                <BarChart2 size={24} strokeWidth={isActive('/stats') ? 2.5 : 2} />
                <span className={isActive('/stats') ? 'font-semibold' : ''}>分析</span>
            </Link>
        </nav>
    );
}
