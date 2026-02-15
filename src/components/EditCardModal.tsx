'use client';

import { useState, useEffect } from 'react';
import { X, Pencil, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { editAnkiCardContent, getUniqueTags } from '@/app/actions';

interface EditCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newQuestion: string, newAnswer: string, newTags: string) => void;
    initialQuestion: string;
    initialAnswer: string;
    initialTags: string;
    rowIndex: number;
}

export default function EditCardModal({
    isOpen,
    onClose,
    onSuccess,
    initialQuestion,
    initialAnswer,
    initialTags,
    rowIndex
}: EditCardModalProps) {
    const [question, setQuestion] = useState(initialQuestion);
    const [answer, setAnswer] = useState(initialAnswer);
    const [tags, setTags] = useState(initialTags);
    const [existingTags, setExistingTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuestion(initialQuestion);
            setAnswer(initialAnswer);
            setTags(initialTags);
            getUniqueTags().then(setExistingTags);
        }
    }, [isOpen, initialQuestion, initialAnswer, initialTags]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const result = await editAnkiCardContent(rowIndex, question, answer, tags);
            if (result.success) {
                onSuccess(question, answer, tags);
                onClose();
            } else {
                console.error('Edit card failed:', result.error);
                setError('Failed to edit card. Please try again.');
            }
        } catch (err) {
            console.error('Unexpected error in EditCardModal:', err);
            setError('An error occurred. Check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-10 bottom-10 md:top-20 md:bottom-auto z-50 max-w-lg mx-auto glass-card rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-50/50 shrink-0">
                            <h2 className="text-lg font-heading font-bold text-slate-800 flex items-center gap-2">
                                <Pencil size={18} className="text-slate-400" />
                                カードを編集
                            </h2>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 overscroll-contain">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-500">質問 (表面)</label>
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[var(--color-main)]/50 text-slate-800 font-hand text-lg resize-none placeholder:text-slate-300 transition-all"
                                    placeholder="質問を入力してください..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-500">答え (裏面)</label>
                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[var(--color-main)]/50 text-slate-800 font-serif text-lg resize-none placeholder:text-slate-300 transition-all"
                                    placeholder="答えを入力してください..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-500">タグ (選択または入力)</label>
                                <input
                                    type="text"
                                    list="edit-tag-suggestions"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-[var(--color-main)]/50 text-slate-800 font-sans text-lg placeholder:text-slate-300 transition-all"
                                    placeholder="タグを選択または入力..."
                                />
                                <datalist id="edit-tag-suggestions">
                                    {existingTags.map(tag => (
                                        <option key={tag} value={tag} />
                                    ))}
                                </datalist>
                            </div>

                            {error && (
                                <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2 pb-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !question.trim() || !answer.trim()}
                                    className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-main)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-[var(--color-main)]/30"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            保存中...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} strokeWidth={2.5} />
                                            変更を保存
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
