export function calculateNextReview(level: number, rating: 'good' | 'ok' | 'bad') {
    const today = new Date();
    let newLevel = level;
    let daysUntilNext = 1;

    if (level === 0) {
        if (rating === 'bad') {
            newLevel = 0;
            daysUntilNext = 1;
        } else if (rating === 'ok') {
            newLevel = 0;
            daysUntilNext = 3;
        } else if (rating === 'good') {
            newLevel = 1;
            // Random 4-6 days
            daysUntilNext = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
        }
    } else {
        // Level 1+
        if (rating === 'bad') {
            newLevel = 0;
            daysUntilNext = 1;
        } else if (rating === 'ok') {
            newLevel = Math.max(0, level - 1);
            daysUntilNext = 2;
        } else if (rating === 'good') {
            newLevel = level + 1;

            // Ranges based on new level
            const ranges: { [key: number]: [number, number] } = {
                1: [2, 4],
                2: [7, 10],
                3: [14, 20],
                4: [30, 45],
                5: [60, 90],
            };

            if (ranges[newLevel]) {
                const [min, max] = ranges[newLevel];
                daysUntilNext = Math.floor(Math.random() * (max - min + 1)) + min;
            } else if (newLevel >= 6) {
                daysUntilNext = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
            } else {
                daysUntilNext = 1;
            }
        }
    }

    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + daysUntilNext);

    // Format YYYY-MM-DD
    const yyyy = nextReviewDate.getFullYear();
    const mm = String(nextReviewDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nextReviewDate.getDate()).padStart(2, '0');

    return {
        level: newLevel,
        nextReview: `${yyyy}-${mm}-${dd}`,
    };
}
