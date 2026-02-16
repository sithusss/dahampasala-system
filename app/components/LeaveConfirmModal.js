// components/LeaveConfirmModal.js
import React, { useState } from 'react';

export default function LeaveConfirmModal({ isOpen, onClose, onConfirm, studentName, lang }) {
  // ඉවත් කිරීමේ ක්‍රියාවලිය සිදුවන අතරතුර button එක disable කිරීමට loading state එකක් පමණක් පාවිච්චි කළ හැක
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;
  const isSi = lang === 'si';

  const handleConfirmClick = async () => {
    setIsDeleting(true);
    await onConfirm(); // Parent component එකේ (Details.js) ඇති function එක ක්‍රියාත්මක වේ
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isSi ? "අස්වීම ස්ථිර කරන්න" : "Confirm Leaving"}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            {isSi 
              ? `ඔබ ඇත්තටම ${studentName} ශිෂ්‍යා පද්ධතියෙන් ඉවත් කිරීමට (Leave) අවශ්‍යද? මෙය ආපසු හැරවිය නොහැක.` 
              : `Are you sure you want to mark ${studentName} as left from the system? This action is permanent.`}
          </p>
        </div>

        <div className="bg-gray-50 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-100 transition active:scale-95 disabled:opacity-50"
          >
            {isSi ? "නැත" : "No, Cancel"}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting 
              ? (isSi ? "ඉවත් කරමින්..." : "Processing...") 
              : (isSi ? "ඔව්, ඉවත් කරන්න" : "Yes, Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}