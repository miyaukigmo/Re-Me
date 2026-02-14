'use client';

import { useState, useEffect } from 'react';
import { AnkiCard, updateAnkiCard, getAnkiSheets, getAnkiCards } from '@/app/actions';
import { Check, X, AlertCircle, Award, CheckCircle, Pencil, Layers, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditCardModal from './EditCardModal';

export default function AnkiSession({ initialCards }: { initialCards: AnkiCard[] }) {
    const [cards, setCards] = useState<AnkiCard[]>([]);
    const [currentCard, setCurrentCard] = useState<AnkiCard | null>(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Advanced Modes State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sheets, setSheets] = useState<string[]>([]);
    const [currentSheet, setCurrentSheet] = useState<string>('Main');
    const [mode, setMode] = useState<'normal' | 'reverse' | 'tag'>('normal');
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [uniqueTags, setUniqueTags] = useState<string[]>([]);

    useEffect(() => {
        // Initial setup
        const loadInitial = async () => {
            const sheetNames = await getAnkiSheets();
            setSheets(sheetNames);
            if (sheetNames.length > 0) setCurrentSheet(sheetNames[0]);

            setCards(initialCards);
            pickNextCard(initialCards, 'normal', 'All');
        };
        loadInitial();
    }, []);

    // Fetch when Sheet Changes
    useEffect(() => {
        if (!currentSheet) return;
        setLoading(true);
        getAnkiCards(currentSheet).then(newCards => {
            console.log(`Loaded ${newCards.length} cards from ${currentSheet}`);
            setCards(newCards);

            const tags = new Set<string>();
            newCards.forEach(c => {
                c.tags.split(',').forEach(t => {
                    if (t.trim()) tags.add(t.trim());
                });
            });
            setUniqueTags(Array.from(tags).sort());

            pickNextCard(newCards, mode, selectedTag);
            setLoading(false);
        });
    }, [currentSheet]);

    // Re-pick when Mode or Tag changes
    useEffect(() => {
        if (cards.length > 0) {
            pickNextCard(cards, mode, selectedTag);
        }
    }, [mode, selectedTag]);

    const pickNextCard = (pool: AnkiCard[], currentMode: string, currentTag: string) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Filter by Tag if needed
        let candidates = pool;
        if (currentMode === 'tag' && currentTag !== 'All') {
            candidates = pool.filter(c => c.tags.includes(currentTag));
        }

        // Filter by Due Date (SRS) based on Mode
        const dueCards = candidates.filter(card => {
            let nextReview = card.next_review;
            if (currentMode === 'reverse') nextReview = card.reverse_next_review;
            if (currentMode === 'tag') nextReview = card.tag_next_review;

            if (!nextReview) return true; // New card or reset
            return nextReview <= today;
        });

        console.log(`Mode: ${currentMode}, Tag: ${currentTag}, Total: ${pool.length}, Candidates: ${candidates.length}, Due: ${dueCards.length}`);

        if (dueCards.length === 0) {
            setCurrentCard(null);
            setCurrentIndex(-1);
            return;
        }

        // Pick random due card
        const randomCard = dueCards[Math.floor(Math.random() * dueCards.length)];
        setCurrentCard(randomCard);
        setCurrentIndex(pool.indexOf(randomCard));
        setShowAnswer(false);
    };

    const handleRating = async (rating: 'fail' | 'hard' | 'good' | 'easy') => {
        if (!currentCard || currentIndex === -1) return;

        let currentLevel = currentCard.level;
        if (mode === 'reverse') currentLevel = currentCard.reverse_level;
        if (mode === 'tag') currentLevel = currentCard.tag_level;

        let nextReviewDate = '';
        let nextLevel = currentLevel;

        const now = new Date();

        switch (rating) {
            case 'fail':
                nextLevel = 0;
                nextReviewDate = now.toISOString().split('T')[0];
                break;
            case 'hard':
                nextLevel = Math.max(0, currentLevel - 1);
                now.setDate(now.getDate() + 1);
                nextReviewDate = now.toISOString().split('T')[0];
                break;
            case 'good':
                nextLevel = currentLevel + 1;
                const daysToAdd = Math.ceil(Math.pow(1.6, nextLevel));
                now.setDate(now.getDate() + daysToAdd);
                nextReviewDate = now.toISOString().split('T')[0];
                break;
            case 'easy':
                nextLevel = currentLevel + 2;
                const daysToAddEasy = Math.ceil(Math.pow(1.8, nextLevel) + 2);
                now.setDate(now.getDate() + daysToAddEasy);
                nextReviewDate = now.toISOString().split('T')[0];
                break;
        }

        const updatedCard = { ...currentCard };
        if (mode === 'normal') {
            updatedCard.level = nextLevel;
            updatedCard.next_review = nextReviewDate;
        } else if (mode === 'reverse') {
            updatedCard.reverse_level = nextLevel;
            updatedCard.reverse_next_review = nextReviewDate;
        } else if (mode === 'tag') {
            updatedCard.tag_level = nextLevel;
            updatedCard.tag_next_review = nextReviewDate;
        }

        const newCards = [...cards];
        newCards[currentIndex] = updatedCard;
        setCards(newCards);

        await updateAnkiCard(currentCard.row_index, nextLevel, nextReviewDate, mode, currentSheet);
        pickNextCard(newCards, mode, selectedTag);
    };

    const handleEditSuccess = (newQuestion: string, newAnswer: string, newTags: string) => {
        setCards(prev => prev.map(card =>
            card.row_index === currentCard?.row_index
                ? { ...card, question: newQuestion, answer: newAnswer, tags: newTags }
                : card
        ));
        if (currentCard) {
            setCurrentCard({ ...currentCard, question: newQuestion, answer: newAnswer, tags: newTags });
        }
    };

    const getQuestionText = () => {
        if (!currentCard) return '';
        return mode === 'reverse' ? currentCard.answer : currentCard.question;
    };

    const getAnswerText = () => {
        if (!currentCard) return '';
        return mode === 'reverse' ? currentCard.question : currentCard.answer;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={24} />
                <span>読み込み中...</span>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full gap-6 mx-auto max-w-sm">
                <div className="bg-green-50 p-4 rounded-full text-green-500 mb-2">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 font-serif">Complete!</h2>
                <p className="text-slate-500 max-w-xs font-serif">
                    {mode === 'normal' && "今日の分の通常復習は完了です！素晴らしい！"}
                    {mode === 'reverse' && "反転学習の今日の分は完了です！"}
                    {mode === 'tag' && `${selectedTag === 'All' ? '全' : selectedTag}タグの学習完了です！`}
                </p>

                <div className="flex gap-3 flex-wrap justify-center w-full mt-4">
                    <div className="relative">
                        <select
                            className="appearance-none p-2.5 pl-4 pr-10 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer min-w-[120px] font-serif"
                            value={currentSheet}
                            onChange={(e) => setCurrentSheet(e.target.value)}
                        >
                            {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            className="appearance-none p-2.5 pl-4 pr-10 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer min-w-[140px] font-serif"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as any)}
                        >
                            <option value="normal">通常モード</option>
                            <option value="reverse">反転モード</option>
                            <option value="tag">タグ集中</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 h-[600px] flex flex-col relative z-0">
            {/* Header / Mode Controls */}
            <div className="absolute top-0 inset-x-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2 max-w-[80%]">
                    {/* Compact Mode/Sheet Indicators */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors max-w-full"
                    >
                        <Layers size={14} className="text-indigo-500 shrink-0" />
                        <span className="truncate">
                            {currentSheet} / {mode === 'normal' ? '通常' : mode === 'reverse' ? '反転' : 'タグ'}
                            {mode === 'tag' && ` : ${selectedTag}`}
                        </span>
                    </button>

                    {/* Expandable Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-slate-200 shadow-lg rounded-xl p-3 flex flex-col gap-3 min-w-[200px] max-w-[240px]"
                            >
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Sheet</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none w-full p-2.5 pl-4 pr-10 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                                            value={currentSheet}
                                            onChange={(e) => { setCurrentSheet(e.target.value); setIsMenuOpen(false); }}
                                        >
                                            {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Mode</label>
                                    <div className="flex bg-slate-100 rounded p-1 gap-1">
                                        {(['normal', 'reverse', 'tag'] as const).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`flex-1 text-xs py-1.5 rounded truncate ${mode === m ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {m === 'normal' ? '通常' : m === 'reverse' ? '反転' : 'タグ'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {mode === 'tag' && (
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Select Tag</label>
                                        <div className="relative">
                                            <select
                                                className="appearance-none w-full p-2.5 pl-4 pr-10 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                                                value={selectedTag}
                                                onChange={(e) => setSelectedTag(e.target.value)}
                                            >
                                                <option value="All">All Tags</option>
                                                {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Area */}
            <div
                className={`flex-1 flex flex-col items-center justify-center p-10 cursor-pointer relative z-0 ${showAnswer ? 'hidden' : 'flex'} bg-slate-50/50`}
                onClick={() => setShowAnswer(true)}
            >
                <div className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-8">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 block">Question</span>
                    <h3 className="text-2xl font-medium text-slate-800 whitespace-pre-wrap leading-relaxed font-hand">
                        {getQuestionText()}
                    </h3>
                </div>
                <div className="absolute bottom-6 text-slate-400 text-sm animate-pulse">
                    Tap to show answer
                </div>
            </div>

            {showAnswer && (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white animate-in fade-in duration-500 overflow-y-auto custom-scrollbar relative">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 block">Answer</span>
                    <h3 className="text-xl font-medium text-slate-800 whitespace-pre-wrap leading-relaxed font-serif">
                        {getAnswerText()}
                    </h3>

                    {/* Edit Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditModalOpen(true);
                        }}
                        className="absolute bottom-4 right-4 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all"
                        aria-label="Edit Card"
                    >
                        <Pencil size={14} />
                    </button>
                </div>
            )}

            {/* Controls */}
            {showAnswer && (
                <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-4 gap-3 z-10">
                    <button onClick={() => handleRating('fail')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors group">
                        <X size={20} className="text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Fail</span>
                    </button>
                    <button onClick={() => handleRating('hard')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group">
                        <AlertCircle size={20} className="text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-orange-600 uppercase">Hard</span>
                    </button>
                    <button onClick={() => handleRating('good')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
                        <Check size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Good</span>
                    </button>
                    <button onClick={() => handleRating('easy')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
                        <Award size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Easy</span>
                    </button>
                </div>
            )}

            <EditCardModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                initialQuestion={currentCard?.question || ''}
                initialAnswer={currentCard?.answer || ''}
                initialTags={currentCard?.tags || ''}
                rowIndex={currentCard?.row_index || 0}
            />
        </div>
    );
}
