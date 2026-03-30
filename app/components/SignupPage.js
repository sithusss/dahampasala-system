"use client";
import { useState } from 'react';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const FRIENDLY_SIGNUP_ERRORS = {
  'auth/operation-not-allowed': 'Email/Password sign-in is disabled. Enable it in Firebase Console > Authentication > Sign-in method.',
  'auth/invalid-api-key': 'Invalid Firebase API key. Re-check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local and restart the dev server.',
  'auth/configuration-not-found': 'Authentication is not configured for this Firebase project. In Firebase Console: 1) Build > Authentication > Get started, 2) Sign-in method > enable Email/Password, 3) Settings > Authorized domains > add localhost, then restart npm run dev.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed': 'Network error while contacting Firebase. Check internet or firewall.',
  'permission-denied': 'Firestore rules blocked user profile creation. Allow signed-in users to write to user/{uid}.',
  'not-found': 'Firestore database not found for this project. Create a Firestore database in Firebase Console.'
};

function getSignupErrorMessage(error) {
  const code = error?.code;
  if (code && FRIENDLY_SIGNUP_ERRORS[code]) return FRIENDLY_SIGNUP_ERRORS[code];
  return error?.message || 'Signup failed.';
}

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    let createdUser = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      createdUser = userCredential.user;

      await setDoc(doc(db, "user", createdUser.uid), {
        uid: createdUser.uid,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email.trim(),
        status: 'pending',
        login: false,
        role: 'editor',
        createdAt: serverTimestamp(),
      });

      toast.success("ලියාපදිංචිය සාර්ථකයි! Admin අනුමැතිය අවශ්‍යයි.");
      router.push('/');
    } catch (error) {
      console.error('Signup failed:', error);

      // If Auth user was created but Firestore write failed, roll back the Auth user.
      if (createdUser && !String(error?.code || '').startsWith('auth/')) {
        try {
          await deleteUser(createdUser);
        } catch {
          await signOut(auth);
        }
      }

      toast.error(getSignupErrorMessage(error));
    } finally {
      setLoading(false);
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
        <section className="h-full overflow-y-auto p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <Image src="/images/dahampasala.png" alt="Dahampasala logo" width={44} height={44} className="rounded-full object-cover border border-gray-300" />
              <Image src="/images/pansala.jpeg" alt="Pansala logo" width={44} height={44} className="rounded-full object-cover border border-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-center text-gray-800 mb-8">SIGN UP</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <input name="fullName" placeholder="Full Name" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
              <input name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
              <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" onChange={handleChange} required className="w-full p-3 border rounded-xl pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" onChange={handleChange} required className="w-full p-3 border rounded-xl pr-12" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <button disabled={loading} className="w-full bg-[#800000] text-white py-3 rounded-xl font-bold hover:bg-black transition-all">
                {loading ? "Registering..." : "REGISTER"}
              </button>
            </form>
          </div>
        </section>

        <section className="hidden lg:block relative bg-[#1a1a1a] min-h-[260px] lg:min-h-full">
          <Image
            src="/images/signupwm.jpg"
            alt="Signup watermark"
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
      </div>
    </main>
  );
}