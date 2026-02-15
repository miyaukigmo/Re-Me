'use client';

import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '@/components/BrandLogo';

type PageHeaderProps = {
    title?: string;
    rightElement?: React.ReactNode;
};

export default function PageHeader({ title, rightElement }: PageHeaderProps) {
    const { themeColor } = useTheme();

    const getThemeColors = () => {
        switch (themeColor) {
            case 'teal': return { bg: 'bg-teal-100', text: 'text-teal-600' };
            case 'rose': return { bg: 'bg-rose-100', text: 'text-rose-600' };
            case 'amber': return { bg: 'bg-amber-100', text: 'text-amber-600' };
            case 'cyan': return { bg: 'bg-cyan-100', text: 'text-cyan-600' };
            case 'slate': return { bg: 'bg-slate-100', text: 'text-slate-600' };
            default: return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
        }
    };

    const colors = getThemeColors();

    return (
        <header className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 supports-[backdrop-filter]:bg-white/60">
            {title ? (
                <h1 className="text-xl font-heading font-bold text-slate-800 tracking-tight">{title}</h1>
            ) : (
                <div className="flex items-center gap-2">
                    <BrandLogo size="sm" className="mt-1" />
                </div>
            )}

            <div className="flex items-center gap-3">
                {rightElement}
                <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold text-xs ring-2 ring-white shadow-sm transition-colors duration-500`}>
                    M
                </div>
            </div>
        </header>
    );
}
