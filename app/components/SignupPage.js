"use client";
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "user", user.uid), {
        uid: user.uid,
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
      toast.error("Signup Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white p-6 md:p-10 rounded-3xl shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-black text-center text-gray-800 mb-6 md:mb-8">SIGN UP</h2>
        <form onSubmit={handleSignup} className="space-y-3 md:space-y-4">
          <input name="fullName" placeholder="Full Name" onChange={handleChange} required className="w-full p-2.5 md:p-3 border rounded-xl text-sm md:text-base" />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} required className="w-full p-2.5 md:p-3 border rounded-xl text-sm md:text-base" />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-2.5 md:p-3 border rounded-xl text-sm md:text-base" />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full p-2.5 md:p-3 border rounded-xl text-sm md:text-base" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="w-full p-2.5 md:p-3 border rounded-xl text-sm md:text-base" />
          <button disabled={loading} className="w-full bg-[#800000] text-white py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base">
            {loading ? "Registering..." : "REGISTER AS EDITOR"}
          </button>
        </form>
      </div>
    </main>
  );
}