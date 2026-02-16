// components/Footer.js
export default function Footer({ lang }) {
  return (
    <footer className="w-full">
      {/* Main Footer Section */}
      <div className="bg-gray-900 text-white py-12 text-center border-t border-gray-800">
        <p className="text-sm px-4">
          © 2026 {lang === 'si' 
            ? 'මහනුවර, අස්ගිරිය, ශ්‍රී සද්ධර්මවර්ධන දහම් පාසල' 
            : 'Sri Saddharmawardhana Dhamma School, Asgiriya, Kandy'}. All Rights Reserved.
        </p>
        <p className="text-xs mt-2 text-gray-500 uppercase tracking-widest">
          Developed for Dhamma School Management
        </p>
      </div>

      {/* Developer Contact Bar (Flex bar like Header) */}
      <div className="bg-[#800000] text-white py-3 px-6 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
          <p className="text-[10px] md:text-xs font-medium tracking-wide">
            Developed by <span className="font-bold">© Sandali Liyanage</span>
          </p>
          <p className="text-[10px] md:text-xs font-medium tracking-wide">
            For technical support: <span className="font-bold">+94 70 375 7159</span>
          </p>
        </div>
      </div>
    </footer>
  );
}