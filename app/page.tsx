"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import toast from 'react-hot-toast';
import Header from '@/app/components/Header';
import RegistrationForm from '@/app/components/RegistrationForm';
import LoginPage from '@/app/components/LoginPage';
import NotificationSidebar from '@/app/components/NotificationSidebar';

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState('si');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setIsLoggedIn(!!role);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userRole === 'super-admin' || userRole === 'admin') {
      const fetchPendingUsers = async () => {
        try {
          const q = query(collection(db, "user"), where("status", "==", "pending"));
          const querySnapshot = await getDocs(q);
          const users: any[] = [];
          querySnapshot.forEach((docSnap) => {
            users.push({ id: docSnap.id, ...docSnap.data() });
          });
          setPendingUsers(users);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchPendingUsers();
      const interval = setInterval(fetchPendingUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const handleAccept = async (userId: string) => {
    try {
      await updateDoc(doc(db, "user", userId), { status: 'active' });
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      toast.success("User accepted!");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await updateDoc(doc(db, "user", userId), { status: 'declined' });
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      toast.success("User declined!");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'editor' && userId) {
        await updateDoc(doc(db, "user", userId), { login: false });
      }
      
      await signOut(auth);
      localStorage.clear();
      toast.success("Logged out successfully!");
      window.location.reload();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        lang={lang}
        setLang={setLang}
        showNotification={['admin', 'super-admin'].includes(userRole || '')}
        onNotificationClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={pendingUsers.length}
      />

      <NotificationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingUsers={pendingUsers}
        onAccept={handleAccept}
        onDecline={handleDecline}
        lang={lang}
      />

      <div className="flex-grow">
        {isLoggedIn ? <RegistrationForm lang={lang} /> : <LoginPage />}
      </div>

      {isLoggedIn && (
        <button 
          onClick={handleLogout} 
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 md:gap-3 font-semibold group z-50 text-xs md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{lang === 'si' ? 'ඉවත් වන්න' : 'Logout'}</span>
        </button>
      )}
    </div>
  );
}
