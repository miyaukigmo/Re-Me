'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAnkiCards, AnkiCard, getAnkiSheets } from '@/app/actions';
import NavBar from '@/components/NavBar';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Loader2, TrendingUp, BookOpen, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function StatsPage() {
    const [cards, setCards] = useState<AnkiCard[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [sheets, setSheets] = useState<string[]>([]);
    const [currentSheet, setCurrentSheet] = useState<string>('Main');
    const [mode, setMode] = useState<'normal' | 'reverse' | 'tag'>('normal');

    // Initial Load
    useEffect(() => {
        getAnkiSheets().then(sheetNames => {
            setSheets(sheetNames);
            if (sheetNames.length > 0) setCurrentSheet(sheetNames[0]);
        });
    }, []);

    // Load Cards when Sheet changes
    useEffect(() => {
        if (!currentSheet) return;
        setLoading(true);
        getAnkiCards(currentSheet).then(data => {
            setCards(data);
            setLoading(false);
        });
    }, [currentSheet]);

    // Calculate Stats based on Mode
    const stats = useMemo(() => {
        if (!cards.length) return null;

        let total = cards.length;
        let levels: number[] = [];

        // Extract levels based on mode
        if (mode === 'normal') {
            levels = cards.map(c => c.level);
        } else if (mode === 'reverse') {
            levels = cards.map(c => c.reverse_level);
        } else if (mode === 'tag') {
            // In tag mode, we count all cards but look at tag_level
            // If we want to filter by tag in analytics, we'd need another selector
            // For now, let's show global tag learning progress
            levels = cards.map(c => c.tag_level);
        }

        // Detailed Breakdown
        const levelCounts = {
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 // 5 includes 5+
        };

        levels.forEach(l => {
            if (l >= 5) levelCounts[5]++;
            else levelCounts[l as 0 | 1 | 2 | 3 | 4]++;
        });

        // Updated Logic: Level 4+ is mature
        const mature = levelCounts[4] + levelCounts[5];
        const learning = levelCounts[1] + levelCounts[2] + levelCounts[3];
        const newCards = levelCounts[0];

        // Retention Rate (Mature vs Total Active)
        // Active = Total - New
        const active = total - newCards;
        const retentionRate = active > 0 ? Math.round((mature / active) * 100) : 0;

        const chartData = [
            { name: 'Lv.0', value: levelCounts[0], fill: '#94a3b8' },
            { name: 'Lv.1', value: levelCounts[1], fill: '#fcd34d' },
            { name: 'Lv.2', value: levelCounts[2], fill: '#fbbf24' },
            { name: 'Lv.3', value: levelCounts[3], fill: '#f59e0b' },
            { name: 'Lv.4', value: levelCounts[4], fill: '#34d399' }, // Emerald-400 (Lighter Green)
            { name: 'Lv.5+', value: levelCounts[5], fill: '#10b981' }, // Emerald-500
        ];

        return {
            total,
            retentionRate,
            chartData,
            counts: { new: newCards, learning, mature }
        };
    }, [cards, mode]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-24 bg-slate-50 font-sans">
            <header className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 supports-[backdrop-filter]:bg-white/60 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-heading font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" />
                        学習データ
                    </h1>
                    <select
                        className="bg-transparent text-sm font-medium text-slate-600 border-none outline-none text-right"
                        value={currentSheet}
                        onChange={(e) => setCurrentSheet(e.target.value)}
                    >
                        {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Mode Selector */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['normal', 'reverse', 'tag'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === m
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {m === 'normal' ? '通常' : m === 'reverse' ? '反転' : 'タグ'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-6 space-y-6 max-w-md mx-auto">

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2"
                    >
                        <div className="bg-indigo-50 p-3 rounded-full text-indigo-500 mb-1">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-3xl font-bold text-slate-700 font-heading">{stats?.total || 0}</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">登録カード数</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2"
                    >
                        <div className="bg-emerald-50 p-3 rounded-full text-emerald-500 mb-1">
                            <BrainCircuit size={24} />
                        </div>
                        <span className="text-3xl font-bold text-slate-700 font-heading">{stats?.retentionRate || 0}%</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">定着率 (Lv.4+)</span>
                    </motion.div>
                </div>

                {/* Detailed Level Breakdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                >
                    <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider flex items-center gap-2">
                        レベル分布詳細 ({mode === 'normal' ? '通常' : mode === 'reverse' ? '反転' : 'タグ'})
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.chartData || []}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Tiny Legend */}
                    <div className="flex justify-between px-2 mt-2">
                        <span className="text-[10px] text-slate-400">Lv.0: New</span>
                        <span className="text-[10px] text-emerald-500 font-bold">Lv.4+: Mature</span>
                    </div>
                </motion.div>

                {/* Motivational Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center p-4"
                >
                    <p className="font-hand text-slate-500 leading-relaxed">
                        {(stats?.counts.mature || 0) > 0
                            ? "知識の庭が、美しく育っています。"
                            : "千里の道も一歩から。今日も積み重ねましょう。"}
                    </p>
                </motion.div>

            </div>

            <NavBar />
        </main>
    );
}
