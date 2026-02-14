import { getDrive, getGoogleSheets, BOOK_SPREADSHEET_NAME } from '@/lib/google-sheets';

export default async function DebugPage() {
    const drive = await getDrive();
    const filesRes = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.spreadsheet'`,
        fields: 'files(id, name)',
    });

    const files = filesRes.data.files || [];

    // Try to find the book spreadsheet
    const bookSheet = files.find(f => f.name === BOOK_SPREADSHEET_NAME);

    let sheetMetadata = null;
    let bookSheetId = bookSheet?.id;

    if (bookSheetId) {
        const sheets = await getGoogleSheets();
        const meta = await sheets.spreadsheets.get({
            spreadsheetId: bookSheetId,
        });
        sheetMetadata = meta.data;
    }

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Google API</h1>

            <h2 className="text-lg font-bold mt-4">Visible Spreadsheets</h2>
            <ul className="list-disc pl-5">
                {files.map(f => (
                    <li key={f.id}>{f.name} ({f.id})</li>
                ))}
            </ul>

            <h2 className="text-lg font-bold mt-4">Target Spreadsheet</h2>
            <p>Looking for: <strong>{BOOK_SPREADSHEET_NAME}</strong></p>
            <p>Found ID: {bookSheetId || 'NOT FOUND'}</p>

            {sheetMetadata && (
                <>
                    <h2 className="text-lg font-bold mt-4">Sheet Metadata</h2>
                    <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(sheetMetadata.sheets, null, 2)}
                    </pre>
                </>
            )}
        </div>
    );
}
