const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function listSpreadsheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    try {
        const res = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name)',
        });
        console.log('--- Spreadsheet List ---');
        res.data.files.forEach(file => {
            console.log(`${file.name}: ${file.id}`);
        });
        console.log('------------------------');
    } catch (err) {
        console.error('Error listing spreadsheets:', err.message);
    }
}

listSpreadsheets();
