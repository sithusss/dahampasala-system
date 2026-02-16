// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDg9MBCaAHsudpAlE9YGUQGy21XBVvqyyk",
  authDomain: "dahampasala-ba690.firebaseapp.com",
  projectId: "dahampasala-ba690",
  storageBucket: "dahampasala-ba690.firebasestorage.app",
  messagingSenderId: "1083832048416",
  appId: "1:1083832048416:web:c6abc4ac4bf42b0bc99545",
  measurementId: "G-DSXGKZDLVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);