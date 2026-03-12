export default function NotificationSidebar({
  isOpen,
  onClose,
  pendingUsers,
  onAccept,
  onDecline,
  lang,
  showUpgradeToggle = false,
  autoUpgradeEnabled = true,
  autoUpgradeSaving = false,
  onAutoUpgradeToggle = () => {}
}) {
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

          {showUpgradeToggle && (
            <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-gray-800 leading-tight">
                  {isSi
                    ? (autoUpgradeEnabled ? 'ස්වයංක්‍රීය ශ්‍රේණි උසස් කිරීම: සක්‍රියයි' : 'ස්වයංක්‍රීය ශ්‍රේණි උසස් කිරීම: අක්‍රියයි')
                    : (autoUpgradeEnabled ? 'Automatic Grade Upgrade: Enabled' : 'Automatic Grade Upgrade: Disabled')}
                </p>
                <button
                  type="button"
                  onClick={() => onAutoUpgradeToggle(!autoUpgradeEnabled)}
                  disabled={autoUpgradeSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all duration-200 shadow-sm ${
                    autoUpgradeEnabled ? 'bg-green-600 border-green-700' : 'bg-gray-300 border-gray-400'
                  } ${autoUpgradeSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label={isSi ? 'ස්වයංක්රීය උසස් කිරීම ටොගල් කරන්න' : 'Toggle auto upgrade'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      autoUpgradeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {isSi
                  ? (autoUpgradeEnabled
                    ?'සක්‍රියයි: සෑම වසරකම ජනවාරි 1 වන දින සිසුන් ස්වයංක්‍රීයවම ඊළඟ ශ්‍රේණියට උසස් කරනු ලැබේ.':
                    'අක්‍රියයි: ස්වයංක්‍රීයව ශ්‍රේණි උසස් කිරීම සිදු නොවේ. සිසුන් උසස් කිරීම සඳහා අදාළ බොත්තම් භාවිතයෙන් එය අතින් (Manually) සිදු කළ හැකිය.')
                  : (autoUpgradeEnabled
                    ? 'Enabled: Students are upgraded automatically every year on Jan 1. Manual floating grade buttons are hidden.'
                    : 'Disabled: Automatic yearly upgrade is turned off. Manual floating grade buttons are available.')} 
              </p>
            </div>
          )}

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
