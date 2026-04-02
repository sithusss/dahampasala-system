"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, setDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import toast from 'react-hot-toast';

// Components
import Header from '@/app/components/Header';
import RegistrationForm from '@/app/components/RegistrationForm';
import LoginPage from '@/app/components/LoginPage';
import NotificationSidebar from '@/app/components/NotificationSidebar';
import AdminPortalModal from '@/app/components/AdminPortalModal';

type PendingUser = {
  id: string;
  [key: string]: unknown;
};

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true); // Spark එක වැලැක්වීමට අලුතින් එක් කළා
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState('si');
  const [autoUpgradeEnabled, setAutoUpgradeEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [lastAutoUpgradePeriod, setLastAutoUpgradePeriod] = useState<string | null>(null);
  const [autoUpgradeFrozen, setAutoUpgradeFrozen] = useState(false);
  const [lastAutoUpgradeDate, setLastAutoUpgradeDate] = useState<Date | null>(null);
  const [autoUpgradeRunning, setAutoUpgradeRunning] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const autoUpgradeSaving = false;

  const isAdminUser = ['admin', 'super-admin', 'superadmin'].includes(userRole || '');
  const isSuperAdmin = userRole === 'super-admin' || userRole === 'superadmin';
  const now = new Date();
  const currentYear = now.getFullYear();
  const isJanFirst = now.getMonth() === 0 && now.getDate() === 1;
  const freezeBySameYear = !!lastAutoUpgradeDate && lastAutoUpgradeDate.getFullYear() === currentYear;
  const effectiveFrozen = autoUpgradeFrozen || freezeBySameYear;
  const freezeAppliesToUser = effectiveFrozen && !isSuperAdmin;

  // Authentication Logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecking(true);
      if (!user) {
        setUserRole(null);
        setIsLoggedIn(false);
        setPendingUsers([]);
        setAuthChecking(false);
        setMounted(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'user', user.uid));
        if (!userDoc.exists()) {
          await signOut(auth);
          localStorage.clear();
          setIsLoggedIn(false);
        } else {
          const role = userDoc.data().role || 'editor';
          setUserRole(role);
          setIsLoggedIn(true);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userEmail', user.email || '');
          localStorage.setItem('userId', user.uid);
        }
      } catch (error) {
        console.error('Error resolving signed-in user:', error);
      } finally {
        setAuthChecking(false);
        setMounted(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Pending Users (Admins only)
  useEffect(() => {
    if (isLoggedIn && (userRole === 'super-admin' || userRole === 'admin')) {
      const fetchPendingUsers = async () => {
        try {
          const q = query(collection(db, "user"), where("status", "==", "pending"));
          const querySnapshot = await getDocs(q);
          const users: PendingUser[] = [];
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
  }, [userRole, isLoggedIn]);

  // Fetch all users for the admin portal
  useEffect(() => {
    if (!isLoggedIn || !isAdminUser || !adminPortalOpen) {
      if (!adminPortalOpen) setUsersLoading(false);
      return;
    }

    const fetchAllUsers = async () => {
      setUsersLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'user'));
        const users: PendingUser[] = [];

        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...docSnap.data() });
        });

        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching all users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchAllUsers();
  }, [adminPortalOpen, isAdminUser, isLoggedIn]);

  // Fetch System Settings
  useEffect(() => {
    if (!isAdminUser || !isLoggedIn) {
      if (isLoggedIn) setSettingsLoaded(true);
      return;
    }

    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, "system_settings", "grade_upgrade");
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
          await setDoc(settingsRef, {
            enable: true,
            frozen: false,
            date: null,
            lastAutoUpgradePeriod: null,
            updatedAt: serverTimestamp()
          }, { merge: true });
          setAutoUpgradeEnabled(true);
        } else {
          const data = settingsSnap.data();
          setAutoUpgradeEnabled(data.enable !== false);
          setAutoUpgradeFrozen(data.frozen === true || data.frozen === 'true');
          setLastAutoUpgradeDate(data.date?.toDate?.() || null);
          setLastAutoUpgradePeriod(data.lastAutoUpgradePeriod || null);
        }
      } catch (error) {
        console.error('Settings fetch error:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    fetchSettings();
  }, [isAdminUser, isLoggedIn]);

  // Auto-Upgrade Logic (Jan 1st)
  useEffect(() => {
    if (!isAdminUser || !settingsLoaded || !autoUpgradeEnabled || effectiveFrozen || autoUpgradeRunning || !isJanFirst) return;

    const periodKey = `jan1-${currentYear}`;
    const runAutoUpgradeIfNeeded = async () => {
      if (lastAutoUpgradePeriod === periodKey) return;
      setAutoUpgradeRunning(true);
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const batch = writeBatch(db);

        studentsSnap.forEach((studentDoc) => {
          const student = studentDoc.data();
          const currentGrade = Number(student.currentGrade ?? student.admittedGrade);
          if (!Number.isNaN(currentGrade) && currentGrade < 11) {
            batch.update(doc(db, 'students', studentDoc.id), {
              currentGrade: currentGrade + 1,
              gradeBeforeUpgrade: currentGrade,
              autoUpgradedAt: serverTimestamp()
            });
          }
        });

        await batch.commit();
        await updateDoc(doc(db, 'system_settings', 'grade_upgrade'), {
          frozen: true,
          date: serverTimestamp(),
          lastAutoUpgradePeriod: periodKey
        });

        setLastAutoUpgradePeriod(periodKey);
        setAutoUpgradeFrozen(true);
        toast.success('Annual upgrade completed!');
      } catch {
        toast.error('Upgrade failed');
      } finally {
        setAutoUpgradeRunning(false);
      }
    };
    runAutoUpgradeIfNeeded();
  }, [isAdminUser, settingsLoaded, autoUpgradeEnabled, effectiveFrozen, autoUpgradeRunning, isJanFirst, lastAutoUpgradePeriod, currentYear]);

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userRole === 'editor' && userId) {
        await updateDoc(doc(db, "user", userId), { login: false });
      }
      await signOut(auth);
      localStorage.clear();
      window.location.reload();
    } catch {
      toast.error("Logout error");
    }
  };

  const handleAccept = async (userId: string, role: 'admin' | 'editor' = 'editor') => {
    try {
      await updateDoc(doc(db, 'user', userId), {
        status: 'active',
        role
      });
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error accepting user:', error);
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'user', userId), { status: 'declined' });
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error declining user:', error);
    }
  };

  const handleMarkRole = async (userId: string, role: 'admin' | 'editor') => {
    try {
      setProcessingUserId(userId);
      await updateDoc(doc(db, 'user', userId), { role });
      setAllUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setProcessingUserId(userId);
      await updateDoc(doc(db, 'user', userId), { status: 'deleted' });
      setAllUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setProcessingUserId(null);
    }
  };

  // Spark එක වැලැක්වීමේ වැදගත්ම කොටස
  if (!mounted || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isLoggedIn && (
        <Header 
          lang={lang}
          setLang={setLang}
          showNotification={['admin', 'super-admin'].includes(userRole || '')}
          onNotificationClick={() => setSidebarOpen(!sidebarOpen)}
          notificationCount={pendingUsers.length}
          showAdminPortal={isAdminUser}
          onAdminPortalClick={() => setAdminPortalOpen(true)}
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
        autoUpgradeFrozen={freezeAppliesToUser}
        onAutoUpgradeToggle={async () => {}}
      />

      <div className="flex-grow">
        {/* දැන් මෙතැනදී isLoggedIn තත්ත්වය නිවැරදිව තහවුරු වී ඇත */}
        {isLoggedIn ? <RegistrationForm lang={lang} /> : <LoginPage />}
      </div>

      {isLoggedIn && (
        <button 
          onClick={handleLogout} 
          className="fixed bottom-6 right-6 bg-[#800000] text-white px-6 py-3 rounded-xl shadow-2xl hover:scale-105 transition-all z-50 flex items-center gap-3 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span>{lang === 'si' ? 'ඉවත් වන්න' : 'Logout'}</span>
        </button>
      )}

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