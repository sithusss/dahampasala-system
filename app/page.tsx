"use client";

import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import LoginPage from '@/app/components/LoginPage';
import toast from 'react-hot-toast';

export default function RootPage() {
  useEffect(() => {
    // Check for auto-logout after 5 hours
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const loginTime = localStorage.getItem('loginTime');
        if (loginTime) {
          const elapsed = new Date().getTime() - parseInt(loginTime);
          const fiveHours = 5 * 60 * 60 * 1000;
          
          if (elapsed > fiveHours) {
            // Auto-logout
            try {
              const userId = localStorage.getItem('userId');
              if (userId) {
                await updateDoc(doc(db, 'user', userId), { login: false });
              }
            } catch (error) {
              console.error('Error updating login status:', error);
            }
            await signOut(auth);
            localStorage.clear();
            toast.error('Session expired. Please log in again.');
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);


  return <LoginPage />;
}
