"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import LoginPage from '@/app/components/LoginPage';

export default function RootPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(Boolean(user));
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authChecking && isLoggedIn) {
      router.replace('/home');
    }
  }, [authChecking, isLoggedIn, router]);

  if (authChecking || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return <LoginPage />;
}
