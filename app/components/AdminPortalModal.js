import { useMemo } from 'react';

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return '-';

  try {
    if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
    }

    const date = new Date(createdAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
    }
  } catch {
    // Ignore formatting errors and fallback below.
  }

  return '-';
};

export default function AdminPortalModal({
  isOpen,
  onClose,
  users,
  loading,
  processingUserId,
  onMarkRole,
  onDeleteUser
}) {
  const sortedUsers = useMemo(
    () =>
      [...users]
        .filter((user) => {
          const role = String(user.role || '').toLowerCase();
          return role !== 'super-admin' && role !== 'superadmin';
        })
        .sort((a, b) => String(a.full_name || '').localeCompare(String(b.full_name || ''))),
    [users]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm p-4 hidden md:flex items-center justify-center">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-[#800000] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Admin Portal</h2>
            <p className="text-xs opacity-85">Manage user roles and account records</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/20 text-2xl leading-none"
            aria-label="Close admin portal"
          >
            &times;
          </button>
        </div>

        <div className="p-5 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading user details...</div>
          ) : sortedUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <div className="space-y-4">
              {sortedUsers.map((user) => {
                const role = String(user.role || '').toLowerCase();
                const isBusy = processingUserId === user.id;
                const disableAdmin = isBusy || role === 'admin' || role === 'super-admin' || role === 'superadmin';
                const disableEditor = isBusy || role === 'editor';

                return (
                  <div key={user.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                      <p><span className="font-bold">Full Name:</span> {user.full_name || '-'}</p>
                      <p><span className="font-bold">Email:</span> {user.email || '-'}</p>
                      <p><span className="font-bold">Phone:</span> {user.phone || '-'}</p>
                      <p><span className="font-bold">Role:</span> {user.role || '-'}</p>
                      <p><span className="font-bold">Status:</span> {user.status || '-'}</p>
                      <p><span className="font-bold">Login:</span> {String(Boolean(user.login))}</p>
                      <p className="md:col-span-2"><span className="font-bold">Created At:</span> {formatCreatedAt(user.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onMarkRole(user.id, 'admin')}
                        disabled={disableAdmin}
                        className={`px-3 py-2 text-xs font-bold rounded-lg text-white ${disableAdmin ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        Mark as Admin
                      </button>
                      <button
                        onClick={() => onMarkRole(user.id, 'editor')}
                        disabled={disableEditor}
                        className={`px-3 py-2 text-xs font-bold rounded-lg text-white ${disableEditor ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        Mark as Editor
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        disabled={isBusy}
                        className={`px-3 py-2 text-xs font-bold rounded-lg text-white ${isBusy ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
