import { getAnkiCards } from '@/app/actions';
import AnkiSession from '@/components/AnkiSession';
import NavBar from '@/components/NavBar';
import AddCardButton from '@/components/AddCardButton';
import PageHeader from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cards = await getAnkiCards();

  return (
    <main className="min-h-screen pb-24 bg-slate-50 flex flex-col font-sans">
      <PageHeader rightElement={<AddCardButton />} />

      <div className="flex-1 flex flex-col justify-center">
        <AnkiSession initialCards={cards} />
      </div>

      {/* Bottom Navigation */}
      <NavBar />
    </main>
  );
}
