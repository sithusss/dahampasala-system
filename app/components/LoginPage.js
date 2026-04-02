"use client";
import { useState } from 'react';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetVerified, setResetVerified] = useState(false);
  const [resetVerifiedEmail, setResetVerifiedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Returns true if the input looks like a phone number
  const isPhone = (value) => /^[+\d][\d\s\-()]{6,}$/.test(value.trim());

  const resolveEmail = async (value) => {
    const input = value.trim();

    if (isPhone(input)) {
      const q = query(collection(db, "user"), where("phone", "==", input));
      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error("Phone number not registered in the system.");
      return snapshot.docs[0].data().email;
    }

    const q = query(collection(db, "user"), where("email", "==", input));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("Email is not registered in the system.");
    return snapshot.docs[0].data().email || input;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = await resolveEmail(identifier);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "user", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const isAdmin = ['super-admin', 'superadmin', 'admin'].includes(userData.role);

        if (isAdmin) {
          localStorage.setItem('userRole', userData.role);
          localStorage.setItem('userEmail', email.trim());
          localStorage.setItem('userId', user.uid);
          toast.success("Admin Login Successful!");
          router.replace('/');
          return;
        }

        if (userData.status === 'active') {
          const loginTime = new Date().getTime();
          await updateDoc(doc(db, "user", user.uid), {
            login: true,
            loginTime: loginTime,
          });
          localStorage.setItem('userRole', userData.role || 'editor');
          localStorage.setItem('userEmail', email.trim());
          localStorage.setItem('userId', user.uid);
          localStorage.setItem('loginTime', loginTime.toString());

          setTimeout(async () => {
            await updateDoc(doc(db, "user", user.uid), { login: false });
            localStorage.clear();
            router.replace('/');
          }, 6 * 60 * 60 * 1000);

          toast.success("Login Successful!");
          router.replace('/');
        } else {
          await signOut(auth);
          toast.error("ඔබේ ගිණුම තවමත් Admin අනුමත කර නොමැත!");
        }
      } else {
        await signOut(auth);
        toast.error("User not found in database!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("දෝෂයක් සිදුවිය: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = () => {
    setResetIdentifier(identifier || '');
    setResetVerified(false);
    setResetVerifiedEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetIdentifier('');
    setResetVerified(false);
    setResetVerifiedEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const value = resetIdentifier.trim();

    if (!value) {
      toast.error("Please enter mobile number or email.");
      return;
    }

    setResetLoading(true);
    try {
      if (!resetVerified) {
        const email = await resolveEmail(value);

        setResetVerified(true);
        setResetVerifiedEmail(email);
        toast.success('Verification successful. Enter new password.');
        return;
      }

      if (!newPassword || !confirmNewPassword) {
        toast.error('Please fill both password fields.');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast.error('Passwords do not match.');
        return;
      }

      const resetResponse = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'reset', email: resetVerifiedEmail, newPassword }),
      });

      const resetResult = await resetResponse.json();
      if (!resetResponse.ok) {
        throw new Error(resetResult.error || 'Password reset failed.');
      }

      toast.success('Password reset successful.');
      closeResetModal();
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Reset failed: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <Image
        src="/images/bg.jpg"
        alt="Background"
        fill
        priority
        className="object-cover opacity-25 z-0"
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 w-full max-w-md lg:w-[75vw] lg:h-[75vh] lg:min-h-[620px] lg:max-w-[1250px] bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <section className="hidden lg:block relative bg-[#1a1a1a] min-h-[260px] lg:min-h-full">
          <Image
            src="/images/loginwm.jpg"
            alt="Login watermark"
            fill
            className="object-cover opacity-25 z-0"
          />
          <div className="relative z-10 h-full p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <Image src="/images/dahampasala.png" alt="Dahampasala logo" width={130} height={130} className="rounded-full object-cover border-2 border-white/30" />
              <Image src="/images/pansala.jpeg" alt="Pansala logo" width={130} height={130} className="rounded-full object-cover border-2 border-white/30" />
            </div>
          </div>
        </section>

        <section className="h-full overflow-y-auto p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <Image src="/images/dahampasala.png" alt="Dahampasala logo" width={44} height={44} className="rounded-full object-cover border border-gray-300" />
              <Image src="/images/pansala.jpeg" alt="Pansala logo" width={44} height={44} className="rounded-full object-cover border border-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-center text-gray-800 mb-8">LOGIN</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email or Phone Number</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none" placeholder="example@mail.com or 07XXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none pr-12" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={openResetModal}
                    className="text-xs font-bold text-[#800000] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-[#800000] text-white py-3 rounded-xl font-bold hover:bg-black transition-all">
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </form>
            <div className="mt-8 text-center border-t pt-6">
              <button onClick={() => router.push('/signup')} className="text-[#800000] font-black hover:underline">
                CREATE ACCOUNT / ලියාපදිංචි වන්න
              </button>
            </div>
          </div>
        </section>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-black text-gray-900 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your mobile number or email. After validation, you can set a new password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number or Email</label>
                <input
                  type="text"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  required
                  placeholder="example@mail.com or 07XXXXXXXX"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              {resetVerified && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none pr-12"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                      >
                        {showNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none pr-12"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                      >
                        {showConfirmNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-3 rounded-xl bg-[#800000] text-white font-bold hover:bg-black disabled:opacity-50"
                >
                  {!resetVerified ? (resetLoading ? "Verifying..." : "Verify") : (resetLoading ? "Resetting..." : "Reset Password")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
