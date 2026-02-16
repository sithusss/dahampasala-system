"use client";
import { useState } from 'react';
import Header from '@/app/components/Header';
import RegistrationForm from '@/app/components/RegistrationForm';
import Footer from '@/app/components/Footer';

export default function Home() {
  const [lang, setLang] = useState('si'); // Default language is Sinhala

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />
      <div className="flex-grow">
        <RegistrationForm lang={lang} />
      </div>
      <Footer lang={lang} />
    </div>
  );
}