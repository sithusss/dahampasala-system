import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode, email, newPassword } = body;

    if (mode !== 'reset') {
      return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Verified email is required.' }, { status: 400 });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const userRecord = await adminAuth.getUserByEmail(email.trim());

    await adminAuth.updateUser(userRecord.uid, { password: String(newPassword) });

    return NextResponse.json({ ok: true, message: 'Password reset successful.' });
  } catch (error) {
    const rawMessage = String(error?.message || 'Reset failed.');
    const lowered = rawMessage.toLowerCase();

    if (lowered.includes('identity toolkit api has not been used') || lowered.includes('identitytoolkit.googleapis.com') || lowered.includes('service_disabled')) {
      return NextResponse.json(
        {
          error:
            'Password reset service is not enabled for the Admin SDK project. Enable Identity Toolkit API and use a service account from the same Firebase project as the app.',
        },
        { status: 500 }
      );
    }

    if (lowered.includes('service account project mismatch')) {
      return NextResponse.json({ error: rawMessage }, { status: 500 });
    }

    return NextResponse.json(
      { error: rawMessage },
      { status: 400 }
    );
  }
}
