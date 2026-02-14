'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState('');

  const themes = [
    'from-indigo-50 to-white',
    'from-teal-50 to-white',
    'from-rose-50 to-white',
    'from-amber-50 to-white',
    'from-slate-100 to-white',
    'from-cyan-50 to-white'
  ];

  useEffect(() => {
    // Random theme on session start
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
  }, [pathname]);

  return (
    <main className={`min-h-screen bg-gradient-to-b ${theme} transition-colors duration-1000`}>
      {children}
    </main>
  );
}
