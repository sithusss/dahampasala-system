// components/Header.js
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ lang, setLang, showNotification, onNotificationClick, notificationCount }) {
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
        <div className="flex gap-4 items-center font-semibold uppercase tracking-wider text-xs ">
          {showNotification && (
            <button
              onClick={onNotificationClick}
              className="relative bg-white text-[#800000] p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-white underline underline-offset-4' : 'text-gray-400'}>English</button>
          <span>|</span>
          <button onClick={() => setLang('si')} className={lang === 'si' ? 'text-white underline underline-offset-4' : 'text-gray-400'}>සිංහල</button>
        </div>
      </div>
      
      {/* Logo Section */}
      <div className="flex flex-col items-center py-4 md:py-8 bg-gray-900">
        {/* Rounded Logo Container */}
        <div className="relative w-16 h-16 md:w-28 md:h-28 mb-2 md:mb-4 border-2 border-white rounded-full overflow-hidden flex items-center justify-center bg-white">
           <Image 
              src="/images/logo.jpg" 
              alt="Logo" 
              fill
              className="object-cover rounded-full p-1"
           />
        </div>
        <h1 className="text-sm md:text-2xl font-bold text-center text-white px-4 max-w-2xl leading-relaxed">
          {lang === 'si' ? 'මහනුවර, අස්ගිරිය, ශ්රී සද්ධර්මවර්ධන දහම් පාසල' : 'Sri Saddharmawardhana Dhamma School, Asgiriya, Kandy'}
        </h1>
      </div>
    </header>
  );
}
