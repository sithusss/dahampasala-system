// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDg9MBCaAHsudpAlE9YGUQGy21XBVvqyyk",
  authDomain: "dahampasala-ba690.firebaseapp.com",
  projectId: "dahampasala-ba690",
  storageBucket: "dahampasala-ba690.firebasestorage.app",
  messagingSenderId: "1083832048416",
  appId: "1:1083832048416:web:c6abc4ac4bf42b0bc99545",
  measurementId: "G-DSXGKZDLVD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };