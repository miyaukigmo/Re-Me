'use server';

import { getGoogleSheets, getDrive, ANKI_SPREADSHEET_ID, BOOK_SPREADSHEET_ID } from '@/lib/google-sheets';

// Helper to get the first sheet name
async function getFirstSheetName(sheets: any, spreadsheetId: string): Promise<string> {
    try {
        const meta = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: 'sheets.properties.title',
        });
        return meta.data.sheets?.[0]?.properties?.title || 'Sheet1';
    } catch (e) {
        console.error('Error fetching sheet name:', e);
        return 'Sheet1';
    }
}

// --- Anki Actions ---

export type AnkiCard = {
    question: string;
    answer: string;
    level: number;
    next_review: string;
    tags: string;
    tag_level: number;       // Col F
    tag_next_review: string; // Col G
    reverse_level: number;   // Col I
    reverse_next_review: string; // Col J
    row_index: number; // For updating
};

export async function getAnkiSheets(): Promise<string[]> {
    try {
        const sheets = await getGoogleSheets();
        const meta = await sheets.spreadsheets.get({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            fields: 'sheets.properties.title',
        });

        const sheetNames = meta.data.sheets?.map((s: any) => s.properties?.title || '').filter(Boolean) || ['Sheet1'];
        return sheetNames.filter((name: string) => name !== 'SelfLog');
    } catch (e) {
        console.error('Error fetching sheets:', e);
        return ['Sheet1'];
    }
}

export async function getAnkiCards(sheetName?: string): Promise<AnkiCard[]> {
    try {
        const sheets = await getGoogleSheets();
        const targetSheet = sheetName || await getFirstSheetName(sheets, ANKI_SPREADSHEET_ID);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            range: `${targetSheet}!A2:J`,
        });

        const rows = response.data.values;
        if (!rows) return [];

        // Map rows to objects
        // A:Question, B:Answer, C:Level, D:NextReview, E:Tags
        // F:TagLevel, G:TagNextReview, H:Unknown, I:ReverseLevel, J:ReverseNextReview
        return rows.map((row: any[], index: number) => ({
            question: row[0] || '',
            answer: row[1] || '',
            level: parseInt(row[2] || '0'),
            next_review: row[3] || '',
            tags: row[4] || '',
            tag_level: parseInt(row[5] || '0'),
            tag_next_review: row[6] || '',
            // H skipped
            reverse_level: parseInt(row[8] || '0'),
            reverse_next_review: row[9] || '',
            row_index: index + 2, // 1-based index, +header
        }));
    } catch (error) {
        console.error('Error fetching Anki cards:', error);
        return [];
    }
}

export async function updateAnkiCard(
    rowIndex: number,
    newLevel: number,
    newNextReview: string,
    mode: 'normal' | 'reverse' | 'tag' = 'normal',
    sheetName?: string
) {
    try {
        const sheets = await getGoogleSheets();
        const targetSheet = sheetName || await getFirstSheetName(sheets, ANKI_SPREADSHEET_ID);

        let range = '';
        if (mode === 'normal') {
            range = `${targetSheet}!C${rowIndex}:D${rowIndex}`; // Col C, D
        } else if (mode === 'tag') {
            range = `${targetSheet}!F${rowIndex}:G${rowIndex}`; // Col F, G
        } else if (mode === 'reverse') {
            range = `${targetSheet}!I${rowIndex}:J${rowIndex}`; // Col I, J
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[newLevel, newNextReview]],
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating Anki card:', error);
        return { success: false, error };
    }
}

export async function addAnkiCard(
    question: string,
    answer: string,
    tags: string
) {
    try {
        const sheets = await getGoogleSheets();
        const sheetName = await getFirstSheetName(sheets, ANKI_SPREADSHEET_ID);

        // Default values for new card
        const level = 0; // Column C (Normal Level)
        const nextReview = new Date().toISOString().split('T')[0]; // Column D (Normal Next Review)
        const tagLevel = 0; // Column F (Tag Level)
        const unknownG = ''; // Column G
        const unknownH = ''; // Column H
        const reverseLevel = 0; // Column I (Reverse Level)
        const reverseNextReview = new Date().toISOString().split('T')[0]; // Column J (Reverse Next Review)

        await sheets.spreadsheets.values.append({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            range: `${sheetName}!A:J`, // Append to columns A-J
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    question,       // A
                    answer,         // B
                    level,          // C
                    nextReview,     // D
                    tags,           // E
                    tagLevel,       // F
                    unknownG,       // G
                    unknownH,       // H
                    reverseLevel,   // I
                    reverseNextReview // J
                ]],
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error adding Anki card:', error);
        // properly serialize error message
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function editAnkiCardContent(
    rowIndex: number,
    question: string,
    answer: string,
    tags: string
) {
    try {
        const sheets = await getGoogleSheets();
        const sheetName = await getFirstSheetName(sheets, ANKI_SPREADSHEET_ID);

        // Update Question (A) and Answer (B)
        await sheets.spreadsheets.values.update({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            range: `${sheetName}!A${rowIndex}:B${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[question, answer]],
            },
        });

        // Update Tags (E)
        await sheets.spreadsheets.values.update({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            range: `${sheetName}!E${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[tags]],
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error editing Anki card:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function getUniqueTags(): Promise<string[]> {
    try {
        const sheets = await getGoogleSheets();
        const sheetName = await getFirstSheetName(sheets, ANKI_SPREADSHEET_ID);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ANKI_SPREADSHEET_ID,
            range: `${sheetName}!E2:E`,
        });

        const rows = response.data.values;
        if (!rows) return [];

        const tags = new Set<string>();
        rows.forEach(row => {
            if (row[0]) {
                // Split by comma if multiple tags are used, otherwise just trim
                const cellTags = row[0].split(',').map((t: string) => t.trim());
                cellTags.forEach((t: string) => {
                    if (t) tags.add(t);
                });
            }
        });

        return Array.from(tags).sort();
    } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
    }
}

// --- Book Actions ---

export type BookQuote = {
    id: number;
    category: string;
    original_text: string;
    my_memo: string;
    is_favorite: boolean;
    last_viewed: string; // Col F
    review_count: number; // Col G
    note: string;
    weight: number;
    status: string;
    row_index: number;
};

export async function getBookQuotes(): Promise<BookQuote[]> {
    try {
        const spreadsheetId = BOOK_SPREADSHEET_ID;
        if (!spreadsheetId) return [];

        const sheets = await getGoogleSheets();
        const sheetName = await getFirstSheetName(sheets, spreadsheetId);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:J`,
        });

        const rows = response.data.values;
        if (!rows) return [];

        // ID, Category, OriginalText, MyMemo, IsFavorite, LastViewed, ReviewCount, Weight, Status, Note
        // A=0, B=1, ... J=9
        return rows.map((row: any[], index: number) => ({
            id: parseInt(row[0] || '0'),
            category: row[1] || '',
            original_text: row[2] || '',
            my_memo: row[3] || '',
            is_favorite: (row[4] || '').toString().toUpperCase() === 'TRUE',
            last_viewed: row[5] || '',
            review_count: parseInt(row[6] || '0'),
            note: row[9] || '', // Column J is 10th (index 9)
            weight: parseInt(row[7] || '10'),
            status: row[8] || 'Mid',
            row_index: index + 2,
        }));
    } catch (error) {
        console.error('Error fetching Book quotes:', error);
        return [];
    }
}

export async function updateBookQuote(
    rowIndex: number,
    updates: {
        my_memo?: string;
        is_favorite?: boolean;
        weight?: number;
        last_viewed?: string;
        review_count?: number;
        note?: string;
        original_text?: string;
    }
) {
    try {
        const spreadsheetId = BOOK_SPREADSHEET_ID;
        if (!spreadsheetId) return { success: false, error: 'Spreadsheet ID not set' };

        const sheets = await getGoogleSheets();
        const sheetName = await getFirstSheetName(sheets, spreadsheetId);

        // We can update individual cells or a batch.
        // MyMemo: Col D
        // IsFavorite: Col E
        // Weight: Col H

        const data = [];

        if (updates.my_memo !== undefined) {
            data.push({
                range: `${sheetName}!D${rowIndex}`,
                values: [[updates.my_memo]],
            });
        }
        if (updates.is_favorite !== undefined) {
            data.push({
                range: `${sheetName}!E${rowIndex}`,
                values: [[updates.is_favorite]],
            });
        }
        if (updates.weight !== undefined) {
            data.push({
                range: `${sheetName}!H${rowIndex}`,
                values: [[updates.weight]],
            });
        }
        if (updates.last_viewed !== undefined) {
            data.push({
                range: `${sheetName}!F${rowIndex}`,
                values: [[updates.last_viewed]],
            });
        }
        if (updates.review_count !== undefined) {
            data.push({
                range: `${sheetName}!G${rowIndex}`,
                values: [[updates.review_count]],
            });
        }
        if (updates.note !== undefined) {
            data.push({
                range: `${sheetName}!J${rowIndex}`,
                values: [[updates.note]],
            });
        }
        if (updates.original_text !== undefined) {
            data.push({
                range: `${sheetName}!C${rowIndex}`,
                values: [[updates.original_text]],
            });
        }

        if (data.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                requestBody: {
                    valueInputOption: 'USER_ENTERED',
                    data: data,
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating Book quote:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
