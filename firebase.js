// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // 1. මේක අලුතින් එකතු කරන්න

const firebaseConfig = {
  apiKey: "AIzaSyDg9MBCaAHsudpAlE9YGUQGy21XBVvqyyk",
  authDomain: "dahampasala-ba690.firebaseapp.com",
  projectId: "dahampasala-ba690",
  storageBucket: "dahampasala-ba690.firebasestorage.app",
  messagingSenderId: "1083832048416",
  appId: "1:1083832048416:web:c6abc4ac4bf42b0bc99545",
  measurementId: "G-DSXGKZDLVD"
};

// Next.js වලදී app එක duplicate නොවී තිබීම සඳහා මේ ක්‍රමය හොඳයි
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // 2. Auth initialize කිරීම

export { db, storage, auth }; // 3. auth export කරන්න