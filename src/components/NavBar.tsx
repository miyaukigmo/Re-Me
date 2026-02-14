'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, BookOpen, BarChart2, Home } from 'lucide-react';

export default function NavBar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex text-[10px] font-medium text-slate-400 z-50 pb-safe">
            <Link href="/" className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/') ? 'text-indigo-600' : 'hover:text-slate-600'}`}>
                <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className={isActive('/') ? 'font-semibold' : ''}>ホーム</span>
            </Link>
            <Link href="/book" className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/book') ? 'text-indigo-600' : 'hover:text-slate-600'}`}>
                <BookOpen size={24} strokeWidth={isActive('/book') ? 2.5 : 2} />
                <span className={isActive('/book') ? 'font-semibold' : ''}>読書ノート</span>
            </Link>
            <Link href="/stats" className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive('/stats') ? 'text-indigo-600' : 'hover:text-slate-600'}`}>
                <BarChart2 size={24} strokeWidth={isActive('/stats') ? 2.5 : 2} />
                <span className={isActive('/stats') ? 'font-semibold' : ''}>分析</span>
            </Link>
        </nav>
    );
}
