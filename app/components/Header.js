// components/Header.js
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ lang, setLang }) {
    const pathname = usePathname();
    const isDetailsPage = pathname === '/details';

  return (
    <header className="w-full shadow-md">
      {/* Top Bar with Language Toggle */}
      <div className="bg-[#800000] text-white p-2 flex justify-between items-center px-6 md:px-20 text-sm border-b border-gray-800">
        <div className="flex gap-4 font-semibold uppercase tracking-wider text-xs ">
            {/* Dynamic Redirect Button */}
          <Link 
            href={isDetailsPage ? "/" : "/details"} 
            className="bg-white text-[#800000] px-3 py-1 rounded-sm hover:bg-gray-200 transition-colors duration-200 font-bold"
          >
            {isDetailsPage 
              ? (lang === 'si' ? 'ලියාපදිංචි කිරීම' : 'Registration') 
              : (lang === 'si' ? 'තොරතුරු බලන්න' : 'View Details')
            }
          </Link>
        </div>
        <div className="flex gap-4 font-semibold uppercase tracking-wider text-xs ">
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-white underline underline-offset-4' : 'text-gray-400'}>English</button>
          <span>|</span>
          <button onClick={() => setLang('si')} className={lang === 'si' ? 'text-white underline underline-offset-4' : 'text-gray-400'}>සිංහල</button>
        </div>
      </div>
      
      {/* Logo Section */}
      <div className="flex flex-col items-center py-8 bg-gray-900">
        {/* Rounded Logo Container */}
        <div className="relative w-28 h-28 mb-4 border-2 border-white rounded-full overflow-hidden flex items-center justify-center bg-white">
           <Image 
              src="/images/logo.jpg" 
              alt="Logo" 
              fill // Container එකට ගැලපෙන ලෙස image එක සකසයි
              className="object-cover rounded-full p-1" // මෙන්න මෙතනින් තමයි රවුම් වෙන්නේ
           />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-center text-white px-4 max-w-2xl leading-relaxed">
          {lang === 'si' ? 'මහනුවර, අස්ගිරිය, ශ්‍රී සද්ධර්මවර්ධන දහම් පාසල' : 'Sri Saddharmawardhana Dhamma School, Asgiriya, Kandy'}
        </h1>
      </div>
    </header>
  );
}