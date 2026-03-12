"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, setDoc, writeBatch, serverTimestamp } from "firebase/firestore";
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
  const [autoUpgradeEnabled, setAutoUpgradeEnabled] = useState(true);
  const [autoUpgradeSaving, setAutoUpgradeSaving] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [lastAutoUpgradeYear, setLastAutoUpgradeYear] = useState<number | null>(null);
  const [autoUpgradeRunning, setAutoUpgradeRunning] = useState(false);

  const isAdminUser = ['admin', 'super-admin', 'superadmin'].includes(userRole || '');

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

  useEffect(() => {
    if (!isAdminUser) {
      setSettingsLoaded(true);
      return;
    }

    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, "system_settings", "grade_upgrade");
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
          await setDoc(settingsRef, {
            autoUpgradeEnabled: true,
            lastAutoUpgradeYear: null,
            updatedAt: serverTimestamp()
          }, { merge: true });
          setAutoUpgradeEnabled(true);
          setLastAutoUpgradeYear(null);
        } else {
          const data = settingsSnap.data();
          setAutoUpgradeEnabled(data.autoUpgradeEnabled !== false);
          setLastAutoUpgradeYear(
            typeof data.lastAutoUpgradeYear === 'number' ? data.lastAutoUpgradeYear : null
          );
        }
      } catch (error) {
        console.error('Error fetching grade upgrade settings:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    fetchSettings();
  }, [isAdminUser]);

  useEffect(() => {
    if (!isAdminUser || !settingsLoaded || !autoUpgradeEnabled || autoUpgradeRunning) return;

    const runAutoUpgradeIfNeeded = async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const janFirst = new Date(currentYear, 0, 1);

      if (now < janFirst || lastAutoUpgradeYear === currentYear) return;

      setAutoUpgradeRunning(true);
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const batch = writeBatch(db);

        studentsSnap.forEach((studentDoc) => {
          const student = studentDoc.data();
          const currentGrade = Number(student.admittedGrade);

          if (Number.isNaN(currentGrade) || currentGrade >= 11) return;

          batch.set(doc(db, 'students', studentDoc.id), {
            ...student,
            admittedGrade: currentGrade + 1,
            previousGrade: currentGrade,
            autoUpgradedAt: serverTimestamp()
          }, { merge: true });
        });

        await batch.commit();

        await setDoc(doc(db, 'system_settings', 'grade_upgrade'), {
          lastAutoUpgradeYear: currentYear,
          lastAutoUpgradeAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        setLastAutoUpgradeYear(currentYear);
        toast.success('Students were automatically upgraded for the new year.');
      } catch (error: any) {
        toast.error('Auto-upgrade failed: ' + error.message);
      } finally {
        setAutoUpgradeRunning(false);
      }
    };

    runAutoUpgradeIfNeeded();
  }, [isAdminUser, settingsLoaded, autoUpgradeEnabled, autoUpgradeRunning, lastAutoUpgradeYear]);

  const handleAutoUpgradeToggle = async (enabled: boolean) => {
    setAutoUpgradeSaving(true);
    try {
      await setDoc(doc(db, 'system_settings', 'grade_upgrade'), {
        autoUpgradeEnabled: enabled,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setAutoUpgradeEnabled(enabled);
      toast.success(enabled ? 'Auto-upgrade enabled.' : 'Auto-upgrade disabled.');
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setAutoUpgradeSaving(false);
    }
  };

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
      {isLoggedIn && (
        <Header 
          lang={lang}
          setLang={setLang}
          showNotification={['admin', 'super-admin'].includes(userRole || '')}
          onNotificationClick={() => setSidebarOpen(!sidebarOpen)}
          notificationCount={pendingUsers.length}
        />
      )}

      <NotificationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingUsers={pendingUsers}
        onAccept={handleAccept}
        onDecline={handleDecline}
        lang={lang}
        showUpgradeToggle={isAdminUser}
        autoUpgradeEnabled={autoUpgradeEnabled}
        autoUpgradeSaving={autoUpgradeSaving}
        onAutoUpgradeToggle={handleAutoUpgradeToggle}
      />

      <div className="flex-grow">
        {isLoggedIn ? <RegistrationForm lang={lang} /> : <LoginPage />}
      </div>

      {isLoggedIn && (
        <button 
          onClick={handleLogout} 
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 md:px-6 py-3 rounded-xl shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-0 md:gap-3 font-semibold group z-50"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="w-0 md:w-auto overflow-hidden md:overflow-visible">{lang === 'si' ? 'ඉවත් වන්න' : 'Logout'}</span>
        </button>
      )}
    </div>
  );
}
