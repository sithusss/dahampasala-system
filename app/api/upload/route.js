import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';


export async function POST(req) {
  try {
    // 1. Form Data එක ලබා ගැනීම
    const formData = await req.formData();
    const file = formData.get('file'); // Front-end එකෙන් එවන නම
    const fullName = formData.get('fullName') || 'Unknown_Student';

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Google Auth සැකසීම
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 3. File එක Buffer එකක් බවට පත් කිරීම
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. අද්විතීය නමක් සෑදීම
    const safeName = fullName.trim().replace(/\s+/g, '_');
    const extension = file.name.split('.').pop();
    const uniqueFileName = `${safeName}_${Date.now()}.${extension}`;

    // 5. Google Drive එකට Upload කිරීම
    const fileMetadata = {
      name: uniqueFileName,
      parents: ['17ONjrVlXxC9wYxokSVpIUIDzlAcXoPMy'] // ඔබේ නිවැරදි Folder ID එක පමණක් මෙහි දමන්න
    };

    const media = {
      mimeType: file.type,
      body: Readable.from(buffer),
    };

    const driveResponse = await drive.files.create({
        requestBody: fileMetadata, // Changed from 'resource' to 'requestBody'
        media: media,
        fields: 'id, webViewLink',
        supportsAllDrives: true,   // Crucial: Allows uploading to shared folders
    });

    // 6. Permissions සැකසීම (Public කිරීම)
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return NextResponse.json({ link: driveResponse.data.webViewLink });

  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
