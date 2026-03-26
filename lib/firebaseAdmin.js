import admin from 'firebase-admin';

export function initAdmin() {
  if (admin.apps.length > 0) return;

  const serviceAccountRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountRaw) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountRaw);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const getAdminAuth = () => {
  initAdmin();
  return admin.auth();
};

export const adminDb = () => {
  initAdmin();
  return admin.firestore();
};