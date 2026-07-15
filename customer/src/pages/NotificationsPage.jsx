import { HiOutlineBell } from 'react-icons/hi2';

const NotificationsPage = () => {
  const notifications = [];

  return (
    <div className="container-tgs py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Notifications</h1>
        <p className="mt-2 text-sm text-charcoal/60">Stay updated with your orders and offers</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal/5 text-charcoal/40">
              <HiOutlineBell size={32} />
            </div>
          </div>
          <p className="text-lg font-medium text-charcoal">No notifications yet</p>
          <p className="mt-2 text-sm text-charcoal/60">We'll notify you about your orders and special offers</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div key={index} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-charcoal">{notification.message}</p>
              <p className="mt-2 text-xs text-charcoal/40">{notification.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
