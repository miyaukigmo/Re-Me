import { getAnkiCards } from '@/app/actions';
import AnkiSession from '@/components/AnkiSession';
import NavBar from '@/components/NavBar';
import AddCardButton from '@/components/AddCardButton';
import BrandLogo from '@/components/BrandLogo';

export default async function Home() {
  const cards = await getAnkiCards();

  return (
    <main className="min-h-screen pb-24 bg-slate-50 flex flex-col font-sans">
      <header className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" className="mt-1" />
        </div>

        <div className="flex items-center gap-3">
          <AddCardButton />
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs ring-2 ring-white shadow-sm">
            M
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <AnkiSession initialCards={cards} />
      </div>

      {/* Bottom Navigation */}
      <NavBar />
    </main>
  );
}
