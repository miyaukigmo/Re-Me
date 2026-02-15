'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function StartupOverlay() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-900"
                >
                    <div className="bg-noise" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="flex flex-col items-center gap-6"
                    >
                        <BrandLogo size="xl" className="text-slate-800" />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <p className="text-slate-400 font-serif italic text-sm tracking-widest">
                                記憶に再会するための静かな装置
                            </p>
                            <div className="w-12 h-[1px] bg-slate-100 mt-4" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="absolute bottom-12 text-[10px] font-sans font-bold text-slate-400 tracking-[0.4em] uppercase"
                    >
                        Loading Device
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
