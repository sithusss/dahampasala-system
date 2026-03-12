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
  autoUpgradeFrozen = false,
  onAutoUpgradeToggle = async (enabled) => {
    void enabled;
  }
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
            <div className={`mb-5 p-4 border rounded-xl ${autoUpgradeFrozen ? 'bg-gray-100 border-gray-300 opacity-75' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className={`text-sm font-bold leading-tight flex items-center gap-1 ${autoUpgradeFrozen ? 'text-gray-500' : 'text-gray-800'}`}>
                  {autoUpgradeFrozen && (
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1C8.676 1 6 3.676 6 7v1H4a1 1 0 00-1 1v13a1 1 0 001 1h16a1 1 0 001-1V9a1 1 0 00-1-1h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z" />
                    </svg>
                  )}
                  {isSi
                    ? (autoUpgradeFrozen
                        ? 'ස්වයංක්‍රීය ශ්‍රේණි උසස් කිරීම: අගුලු දමා ඇත'
                        : autoUpgradeEnabled
                          ? 'ස්වයංක්‍රීය ශ්‍රේණි උසස් කිරීම: සක්‍රියයි'
                          : 'ස්වයංක්‍රීය ශ්‍රේණි උසස් කිරීම: අක්‍රියයි')
                    : (autoUpgradeFrozen
                        ? 'Automatic Grade Upgrade: Locked'
                        : autoUpgradeEnabled
                          ? 'Automatic Grade Upgrade: Enabled'
                          : 'Automatic Grade Upgrade: Disabled')}
                </p>
                <button
                  type="button"
                  onClick={() => !autoUpgradeFrozen && !autoUpgradeSaving && onAutoUpgradeToggle(!autoUpgradeEnabled)}
                  disabled={autoUpgradeSaving || autoUpgradeFrozen}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-all duration-200 shadow-sm cursor-not-allowed ${
                    autoUpgradeFrozen
                      ? 'bg-gray-300 border-gray-400'
                      : autoUpgradeEnabled
                        ? 'bg-green-600 border-green-700 cursor-pointer'
                        : 'bg-gray-300 border-gray-400 cursor-pointer'
                  } ${autoUpgradeSaving ? 'opacity-60' : ''}`}
                  aria-label={isSi ? 'ස්වයංක්රීය උසස් කිරීම ටොගල් කරන්න' : 'Toggle auto upgrade'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition ${
                      autoUpgradeFrozen ? 'bg-gray-400 translate-x-6' : autoUpgradeEnabled ? 'bg-white translate-x-6' : 'bg-white translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className={`text-xs mt-2 leading-relaxed ${autoUpgradeFrozen ? 'text-gray-500' : 'text-gray-600'}`}>
                {isSi
                  ? (autoUpgradeFrozen
                    ? 'අගුලු දමා ඇත: මේ වසර සඳහා ස්වයංක්‍රීය උසස් කිරීම දැනටමත් සිදු කර ඇත. දෙසැම්බර් 31 දක්වා මෙම සැකසීම වෙනස් කළ නොහැක.'
                    : autoUpgradeEnabled
                      ? 'සක්‍රියයි: සෑම වසරකම ජනවාරි 1 වන දින සිසුන් ස්වයංක්‍රීයවම ඊළඟ ශ්‍රේණියට උසස් කරනු ලැබේ.'
                      : 'අක්‍රියයි: ස්වයංක්‍රීය උසස් කිරීම ක්‍රියාවිරහිතයි. ඔබට අතින් (Manual) ශ්‍රේණි යාවත්කාලීන කළ හැකිය.')
                  : (autoUpgradeFrozen
                    ? 'Locked: Auto-upgrade completed for this year. Toggle is frozen until Dec 31.'
                    : autoUpgradeEnabled
                      ? 'Enabled: Automatic upgrades occur every Jan 1st. Manual grade buttons are hidden.'
                      : 'Disabled: Manual upgrades are required. Manual grade buttons are available.')
                }
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
