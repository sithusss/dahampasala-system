"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Components
import Header from '@/app/components/Header';
import RegistrationForm from '@/app/components/RegistrationForm';
import NotificationSidebar from '@/app/components/NotificationSidebar';
import AdminPortalModal from '@/app/components/AdminPortalModal';

type PendingUser = {
  id: string;
  [key: string]: unknown;
};

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true); 
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState('si');
  const [autoUpgradeEnabled, setAutoUpgradeEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const isAdminUser = ['admin', 'super-admin', 'superadmin'].includes(userRole || '');

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setAuthChecking(false);
        router.push('/'); // ලොග් වී නැතිනම් Login එකට යවන්න
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'user', user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role || 'editor';
          setUserRole(role);
          setIsLoggedIn(true);
        } else {
          await signOut(auth);
          router.push('/');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/');
      } finally {
        setAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Admin settings and pending users fetching (Only if logged in)
  useEffect(() => {
    if (isLoggedIn && isAdminUser) {
      const fetchPending = async () => {
        try {
          const q = query(collection(db, "user"), where("status", "==", "pending"));
          const snap = await getDocs(q);
          setPendingUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (error) {
          console.error('Error fetching pending users:', error);
        }
      };
      fetchPending();
    }
  }, [isLoggedIn, isAdminUser]);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return String(error || 'Unknown error');
  };

  const loadAllUsers = async () => {
    if (!isAdminUser) return;

    setUsersLoading(true);
    try {
      const snap = await getDocs(collection(db, 'user'));
      const users = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setAllUsers(users);
    } catch (error) {
      toast.error('Error loading users: ' + getErrorMessage(error));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenAdminPortal = async () => {
    setAdminPortalOpen(true);
    await loadAllUsers();
  };

  const handleAccept = async (userId: string, role: 'admin' | 'editor' = 'editor') => {
    try {
      await updateDoc(doc(db, "user", userId), {
        status: 'active',
        role
      });
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success(role === 'admin' ? 'User accepted as admin!' : 'User accepted as editor!');
    } catch (error) {
      toast.error('Error: ' + getErrorMessage(error));
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await updateDoc(doc(db, "user", userId), { status: 'declined' });
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success('User declined!');
    } catch (error) {
      toast.error('Error: ' + getErrorMessage(error));
    }
  };

  const handleMarkRole = async (userId: string, role: 'admin' | 'editor') => {
    setProcessingUserId(userId);
    try {
      await updateDoc(doc(db, 'user', userId), { role });
      setAllUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
      toast.success(role === 'admin' ? 'User marked as admin.' : 'User marked as editor.');
    } catch (error) {
      toast.error('Error: ' + getErrorMessage(error));
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setProcessingUserId(userId);
    try {
      await deleteDoc(doc(db, 'user', userId));
      setAllUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success('User deleted successfully.');
    } catch (error) {
      toast.error('Error: ' + getErrorMessage(error));
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await updateDoc(doc(db, 'user', userId), { login: false });
      }
      await signOut(auth);
      localStorage.clear();
      router.push('/');
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // Spark එක වැලැක්වීමට මෙම කොටස අත්‍යවශ්‍යයි
  if (!mounted || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  // ලොග් වී නැතිනම් කිසිවක් පෙන්වන්න එපා (Redirect වෙන තෙක්)
  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        lang={lang}
        setLang={setLang}
        showNotification={isAdminUser}
        onNotificationClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={pendingUsers.length}
        showAdminPortal={isAdminUser}
        onAdminPortalClick={handleOpenAdminPortal}
      />

      <NotificationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingUsers={pendingUsers}
        onAccept={handleAccept}
        onDecline={handleDecline}
        lang={lang}
        showUpgradeToggle={isAdminUser}
        autoUpgradeEnabled={autoUpgradeEnabled}
        autoUpgradeSaving={false}
        autoUpgradeFrozen={false}
        onAutoUpgradeToggle={async () => {}}
      />

      <div className="flex-grow">
        <RegistrationForm lang={lang} />
      </div>

      <button 
        onClick={handleLogout} 
        className="fixed bottom-6 right-6 bg-[#800000] text-white px-6 py-3 rounded-xl shadow-2xl hover:scale-105 transition-all z-50 flex items-center gap-3 font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>{lang === 'si' ? 'ඉවත් වන්න' : 'Logout'}</span>
      </button>

      <AdminPortalModal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        users={allUsers}
        loading={usersLoading}
        processingUserId={processingUserId}
        onMarkRole={handleMarkRole}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}