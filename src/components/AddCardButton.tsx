'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddCardModal from './AddCardModal';
import { useRouter } from 'next/navigation';

export default function AddCardButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh(); // Refresh server components to show new data (though AnkiSession might not update immediately without full reload if it uses initialCards prop)
        // Actually AnkiSession uses initialCards, so router.refresh() updates the props passed to it!
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                aria-label="Add Card"
            >
                <Plus size={18} strokeWidth={2.5} />
            </button>

            <AddCardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}
