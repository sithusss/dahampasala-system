export default function NotificationSidebar({ isOpen, onClose, pendingUsers, onAccept, onDecline, lang }) {
  const isSi = lang === 'si';

  return (
    <>
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">{isSi ? 'දැනුම්දීම්' : 'Notifications'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <div key={user.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#800000]">
                  <p className="text-sm font-bold text-gray-800 mb-2">{user.full_name}</p>
                  <p className="text-xs text-gray-600 mb-3">Request for system access</p>
                  <div className="flex gap-2">
                    <button onClick={() => onAccept(user.id)} className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-bold hover:bg-green-700">
                      Accept
                    </button>
                    <button onClick={() => onDecline(user.id)} className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-700">
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#800000]">
                <p className="text-sm text-gray-600">{isSi ? 'දැනුම්දීම් නොමැත' : 'No notifications'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-30"></div>
      )}
    </>
  );
}
