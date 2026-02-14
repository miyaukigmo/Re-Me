'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LogoComparisonPage() {
    const fontOptions = [
        {
            category: 'Classic Calligraphy',
            description: '王道で気品のある、伝統的なカリグラフィースタイル',
            fonts: [
                { name: 'Great Vibes', variable: 'var(--font-great-vibes)', weight: 'font-normal' },
                { name: 'Pinyon Script', variable: 'var(--font-pinyon)', weight: 'font-normal' },
                { name: 'Italianno', variable: 'var(--font-italianno)', weight: 'font-normal' },
            ]
        },
        {
            category: 'Luxury & Elegant',
            description: '流れるようなラインが美しい、洗練されたラグジュアリースタイル',
            fonts: [
                { name: 'Alex Brush', variable: 'var(--font-alex-brush)', weight: 'font-normal' },
                { name: 'Parisienne', variable: 'var(--font-parisienne)', weight: 'font-normal' },
                { name: 'Sacramento', variable: 'var(--font-sacramento)', weight: 'font-normal' },
            ]
        },
        {
            category: 'Handwritten Chic',
            description: '親しみやすさと繊細さが同居する、現代的な手書きスタイル',
            fonts: [
                { name: 'Caveat', variable: 'var(--font-caveat)', weight: 'font-bold' },
                { name: 'Dancing Script', variable: 'var(--font-dancing-script)', weight: 'font-bold' },
                { name: 'Petit Formal Script', variable: 'var(--font-petit-formal)', weight: 'font-normal' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 font-serif">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-20">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">Elegant Script Comparison</h1>
                    <p className="text-slate-500 italic">「Re:Me」に命を吹き込む、繊細な筆跡のバリエーション</p>
                </header>

                <div className="space-y-24">
                    {fontOptions.map((group) => (
                        <section key={group.category} className="space-y-8">
                            <div className="border-l-4 border-rose-200 pl-4 py-1">
                                <h2 className="text-xl font-bold text-slate-800">{group.category}</h2>
                                <p className="text-sm text-slate-400 italic">{group.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {group.fonts.map((font) => (
                                    <motion.div
                                        key={font.name}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center gap-8 group transition-all"
                                    >
                                        <div
                                            className={`text-6xl text-slate-800 transition-all duration-300 group-hover:text-rose-400 ${font.weight}`}
                                            style={{ fontFamily: font.variable }}
                                        >
                                            Re:Me
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Font Family</div>
                                            <div className="text-xs text-slate-400 font-mono">{font.name}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <footer className="mt-32 text-center text-slate-400 text-sm">
                    <p className="mb-4 text-slate-300">気に入った筆跡はありましたか？🌸</p>
                    <div className="flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
                        {/* Subtle indicators icons can go here if needed */}
                    </div>
                </footer>
            </div>
        </div>
    );
}
