import { getBookQuotes } from '@/app/actions';
import BookSession from '@/components/BookSession';
import NavBar from '@/components/NavBar';

export const dynamic = 'force-dynamic';

export default async function BookPage() {
    const quotes = await getBookQuotes();

    return (
        <main className="min-h-screen pb-24 bg-slate-50 flex flex-col font-sans">
            <header className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 supports-[backdrop-filter]:bg-white/60">
                <h1 className="text-xl font-heading font-bold text-slate-800 tracking-tight">Reading Notes</h1>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs ring-2 ring-white shadow-sm">
                    M
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center">
                <BookSession initialQuotes={quotes} />
            </div>

            <NavBar />
        </main>
    );
}
