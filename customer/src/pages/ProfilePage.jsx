import { useAuth } from '../context/AuthContext.jsx';

const ProfilePage = () => {
  const { user } = useAuth();

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown';

  return (
    <div className="container-tgs py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Profile</h1>
        <p className="mt-2 text-sm text-charcoal/60">Manage your account details</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-charcoal">{user?.name}</h2>
              <p className="text-sm text-charcoal/60">Member since {joinedDate}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal/5 text-charcoal/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Email</p>
                <p className="mt-1 text-sm text-charcoal">{user?.email}</p>
              </div>
            </div>

            {user?.phone && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal/5 text-charcoal/60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Phone</p>
                  <p className="mt-1 text-sm text-charcoal">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal/5 text-charcoal/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Joined</p>
                <p className="mt-1 text-sm text-charcoal">{joinedDate}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 px-4 py-3 text-sm font-medium text-charcoal transition-colors duration-300 hover:border-primary-500 hover:text-primary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <button className="flex-1 rounded-xl border-2 border-charcoal/20 px-4 py-3 text-sm font-medium text-charcoal/50 cursor-not-allowed">
              Change Password (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
