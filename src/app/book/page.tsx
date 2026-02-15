import { getBookQuotes } from '@/app/actions';
import BookSession from '@/components/BookSession';
import NavBar from '@/components/NavBar';
import PageHeader from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function BookPage() {
    const quotes = await getBookQuotes();

    return (
        <main className="min-h-screen pb-24 bg-slate-50 flex flex-col font-sans">
            <PageHeader title="Reading Notes" />

            <div className="flex-1 flex flex-col items-center">
                <BookSession initialQuotes={quotes} />
            </div>

            <NavBar />
        </main>
    );
}
