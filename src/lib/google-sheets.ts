import { google } from 'googleapis';

const getAuth = () => {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.readonly',
        ],
    });
};

export const getGoogleSheets = async () => {
    const auth = getAuth();
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client as any });
};

export const getDrive = async () => {
    const auth = getAuth();
    const client = await auth.getClient();
    return google.drive({ version: 'v3', auth: client as any });
}

export const ANKI_SPREADSHEET_ID = process.env.ANKI_SPREADSHEET_ID || '';
export const BOOK_SPREADSHEET_ID = process.env.BOOK_SPREADSHEET_ID || '';
