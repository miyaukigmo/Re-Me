'use client';

import { useState, useEffect } from 'react';
import { BookQuote, updateBookQuote } from '@/app/actions';
import { Heart, Edit2, Check, Sparkles, ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookSession({ initialQuotes }: { initialQuotes: BookQuote[] }) {
    const [quotes, setQuotes] = useState<BookQuote[]>([]);
    const [currentQuote, setCurrentQuote] = useState<BookQuote | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [isAnimating, setIsAnimating] = useState(false);

    // Edit States
    const [editMode, setEditMode] = useState<'none' | 'edit' | 'note'>('none');
    const [editOriginalText, setEditOriginalText] = useState('');
    const [editMemo, setEditMemo] = useState('');
    const [editNote, setEditNote] = useState('');

    useEffect(() => {
        setQuotes(initialQuotes);
        pickNext(initialQuotes, 'All');
    }, [initialQuotes]);

    const pickNext = (pool: BookQuote[], category: string) => {
        let filteredPool = pool;
        if (category !== 'All') {
            filteredPool = pool.filter(q => q.category === category);
        }

        if (filteredPool.length === 0) {
            setCurrentQuote(null);
            return;
        }

        setIsAnimating(true);
        setTimeout(() => {
            const unviewed = filteredPool.filter(q => !q.last_viewed || q.last_viewed.trim() === '');

            let next: BookQuote;
            if (unviewed.length > 0) {
                next = unviewed[Math.floor(Math.random() * unviewed.length)];
            } else {
                next = getWeightedRandom(filteredPool);
            }

            setCurrentQuote(next);
            setEditMode('none');
            setIsAnimating(false);
        }, 200);
    };

    const getWeightedRandom = (pool: BookQuote[]) => {
        const totalWeight = pool.reduce((sum, q) => sum + (q.weight || 10), 0);
        let random = Math.random() * totalWeight;

        for (const q of pool) {
            random -= (q.weight || 10);
            if (random <= 0) return q;
        }
        return pool[0];
    };

    const categories = Array.from(new Set(initialQuotes.map(q => q.category).filter(Boolean))).sort();

    const handleNext = async () => {
        if (editMode !== 'none') return;

        if (currentQuote) {
            const now = new Date();
            const lastViewed = now.toLocaleString('ja-JP', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).replace(/\//g, '-');

            const newWeight = Math.max(1, (currentQuote.weight || 10) - 1);
            const newReviewCount = (currentQuote.review_count || 0) + 1;

            const updates = {
                weight: newWeight,
                last_viewed: lastViewed,
                review_count: newReviewCount
            };

            updateBookQuote(currentQuote.row_index, updates);

            const updatedBatch = quotes.map(q => q.id === currentQuote.id ? { ...q, ...updates } : q);
            setQuotes(updatedBatch);
            pickNext(updatedBatch, filterCategory);
        } else {
            pickNext(quotes, filterCategory);
        }
    };

    const handleNiceToMeet = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentQuote || isAnimating) return;
        const newWeight = (currentQuote.weight || 10) + 1;
        const updated = { ...currentQuote, weight: newWeight };
        setCurrentQuote(updated);
        setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
        await updateBookQuote(currentQuote.row_index, { weight: newWeight });
    };

    const handleCategoryChange = (cat: string) => {
        setFilterCategory(cat);
        pickNext(quotes, cat);
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentQuote) return;
        const newFav = !currentQuote.is_favorite;
        const updated = { ...currentQuote, is_favorite: newFav };
        setCurrentQuote(updated);
        setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
        await updateBookQuote(currentQuote.row_index, { is_favorite: newFav });
    };

    const saveEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentQuote) return;

        let updates: any = {};
        if (editMode === 'edit') {
            updates = { original_text: editOriginalText, my_memo: editMemo };
        } else if (editMode === 'note') {
            updates = { note: editNote };
        }

        const updated = { ...currentQuote, ...updates };
        setCurrentQuote(updated);
        setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
        setEditMode('none');

        await updateBookQuote(currentQuote.row_index, updates);
    };

    if (!currentQuote && quotes.length > 0 && !isAnimating) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full gap-4">
                <p className="text-slate-400">このカテゴリにはメモがありません</p>
                <button
                    onClick={() => handleCategoryChange('All')}
                    className="text-indigo-600 font-bold text-sm"
                >
                    すべて表示に戻る
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto w-full h-full flex flex-col items-center px-4 pt-2">

            {/* Category Selector */}
            <div className="w-full mb-6 flex justify-center">
                <div className="relative inline-block group">
                    <select
                        value={filterCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-full px-6 py-2 pr-10 text-xs font-bold text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer uppercase tracking-wider font-serif"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="relative w-full flex-1 flex flex-col items-center justify-center pb-12">
                <AnimatePresence mode="wait">
                    {currentQuote && !isAnimating && (
                        <motion.div
                            key={currentQuote.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.3 }}
                            onClick={handleNext}
                            className="relative w-full max-w-[340px] h-full max-h-[calc(100vh-180px)] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden cursor-pointer active:scale-[0.98] my-auto"
                        >
                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col p-8 overflow-hidden">

                                {/* Quote Area */}
                                <div className="max-h-[35%] shrink-0 w-full overflow-y-auto custom-scrollbar flex items-start justify-center pt-2">
                                    <h2 className="text-xl font-medium text-slate-800 leading-loose whitespace-pre-wrap text-center font-serif">
                                        {currentQuote.original_text}
                                    </h2>
                                </div>

                                {/* Meta Info Area */}
                                <div className="w-full flex justify-between items-center py-3 px-2 shrink-0 border-t border-slate-50/50 mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] font-serif">{currentQuote.category}</span>
                                        {!currentQuote.last_viewed && (
                                            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-widest mt-0.5 font-serif"> NEW</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-[10px] text-slate-300 tracking-widest uppercase font-serif">W:{currentQuote.weight || 10}</span>
                                        <span className="text-[8px] text-slate-200 uppercase tracking-tighter font-serif">Views: {currentQuote.review_count || 0}</span>
                                    </div>
                                </div>

                                {/* Editor / Display Area */}
                                <div className="flex-1 w-full flex flex-col relative overflow-hidden mt-1">
                                    {editMode !== 'none' ? (
                                        <div className="flex-1 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full h-full overflow-hidden" onClick={e => e.stopPropagation()}>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                                {editMode === 'edit' ? (
                                                    <>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-2">Original Text</label>
                                                            <textarea
                                                                value={editOriginalText}
                                                                onChange={(e) => setEditOriginalText(e.target.value)}
                                                                className="w-full p-4 text-sm text-slate-700 bg-slate-50 rounded-2xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-medium leading-relaxed font-serif"
                                                                rows={3}
                                                                placeholder="引用文の修正..."
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-2">My Memo</label>
                                                            <textarea
                                                                value={editMemo}
                                                                onChange={(e) => setEditMemo(e.target.value)}
                                                                className="w-full p-4 text-sm text-slate-600 bg-slate-50 rounded-2xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-medium leading-relaxed font-serif"
                                                                rows={3}
                                                                placeholder="メモの入力..."
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider ml-2">Note (Context)</label>
                                                        <textarea
                                                            value={editNote}
                                                            onChange={(e) => setEditNote(e.target.value)}
                                                            className="w-full p-4 text-sm text-slate-600 bg-slate-50 rounded-2xl border border-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-100 resize-none font-medium leading-relaxed font-serif"
                                                            rows={6}
                                                            placeholder="文章についての注釈..."
                                                            autoFocus
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-2 px-1 py-2 shrink-0 border-t border-slate-50">
                                                <button onClick={(e) => { e.stopPropagation(); setEditMode('none'); }} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">キャンセル</button>
                                                <button onClick={saveEdit} className={`px-6 py-2 ${editMode === 'edit' ? 'bg-indigo-600' : 'bg-cyan-600'} text-white text-xs font-extrabold rounded-xl shadow-lg transition-colors flex items-center gap-2`}><Check size={14} /> 保存</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto custom-scrollbar py-2 flex flex-col gap-4">
                                            {/* Note */}
                                            {currentQuote.note && (
                                                <div className="px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100/50 shrink-0">
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 opacity-50 flex items-center gap-1.5"><MessageSquare size={10} /> Note</p>
                                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic font-serif">{currentQuote.note}</p>
                                                </div>
                                            )}
                                            {/* Memo */}
                                            {currentQuote.my_memo ? (
                                                <div className="border-l-2 border-indigo-100 pl-4 py-1">
                                                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed whitespace-pre-wrap font-serif">
                                                        {currentQuote.my_memo}
                                                    </p>
                                                </div>
                                            ) : (
                                                !currentQuote.note && (
                                                    <div className="h-full flex items-center justify-center opacity-40 py-8">
                                                        <p className="text-[10px] text-slate-300 italic">タップしてメモや注釈を追加</p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="w-full bg-slate-50/50 border-t border-slate-100/50 p-6 flex justify-around items-center shrink-0">
                                <button
                                    onClick={handleNiceToMeet}
                                    className="flex flex-col items-center gap-1.5 p-2 transition-all active:scale-90 group"
                                >
                                    <div className="p-3 rounded-2xl bg-amber-50/50 text-amber-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors shadow-sm">
                                        <Sparkles size={20} />
                                    </div>
                                    <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-tighter">Nice!</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditMode('edit');
                                        setEditOriginalText(currentQuote.original_text || '');
                                        setEditMemo(currentQuote.my_memo || '');
                                    }}
                                    className="flex flex-col items-center gap-1.5 p-2 transition-all active:scale-90 group"
                                >
                                    <div className="p-3 rounded-2xl bg-indigo-50/50 text-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors shadow-sm">
                                        <Edit2 size={20} />
                                    </div>
                                    <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-tighter">Edit</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditMode('note');
                                        setEditNote(currentQuote.note || '');
                                    }}
                                    className="flex flex-col items-center gap-1.5 p-2 transition-all active:scale-90 group"
                                >
                                    <div className="p-3 rounded-2xl bg-cyan-50/50 text-cyan-300 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors shadow-sm">
                                        <MessageSquare size={20} />
                                    </div>
                                    <span className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-tighter">Note</span>
                                </button>

                                <button
                                    onClick={toggleFavorite}
                                    className="flex flex-col items-center gap-1.5 p-2 transition-all active:scale-90 group"
                                >
                                    <div className={`p-3 rounded-2xl transition-all shadow-sm ${currentQuote.is_favorite ? 'bg-rose-100 text-rose-500' : 'bg-rose-50/50 text-rose-300 group-hover:bg-rose-50 group-hover:text-rose-500'}`}>
                                        <Heart size={20} className={currentQuote.is_favorite ? 'fill-current' : ''} />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${currentQuote.is_favorite ? 'text-rose-500' : 'text-rose-400/60'}`}>Fav</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-4 text-slate-300 text-[10px] font-bold tracking-[0.3em] uppercase opacity-30">
                    Next Wisdom
                </div>
            </div>
        </div>
    );
}
