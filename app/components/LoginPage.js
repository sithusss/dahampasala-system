"use client";
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // .trim() භාවිතයෙන් email එකේ ඇති හිස්තැන් ඉවත් කරයි
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // "user" collection එකෙන් දත්ත ලබා ගැනීම
      const userDoc = await getDoc(doc(db, "user", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Admin හෝ Super-Admin පරීක්ෂාව
        const isAdmin = ['super-admin', 'superadmin', 'admin'].includes(userData.role);
        
        if (isAdmin) {
          localStorage.setItem('userRole', userData.role);
          localStorage.setItem('userEmail', email.trim());
          localStorage.setItem('userId', user.uid);
          toast.success("Admin Login Successful!");
          window.location.href = '/';
          return;
        }
        
        // සාමාන්‍ය Editor පරීක්ෂාව
        if (userData.status === 'active') {
          await updateDoc(doc(db, "user", user.uid), { login: true });
          localStorage.setItem('userRole', userData.role || 'editor');
          localStorage.setItem('userEmail', email.trim());
          localStorage.setItem('userId', user.uid);
          toast.success("Login Successful!");
          window.location.href = '/';
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-black text-center text-gray-800 mb-8">LOGIN</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none" placeholder="example@mail.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#800000] outline-none" placeholder="••••••••" />
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
    </main>
  );
}