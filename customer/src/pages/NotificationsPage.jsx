import { useEffect, useState } from 'react';
import { HiOutlineBell, HiCheck, HiOutlineTrash } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { getNotificationsApi, markAsReadApi, markAllAsReadApi, deleteNotificationApi } from '../api/notificationApi.js';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await getNotificationsApi();
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadApi(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotificationApi(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (notifications.find(n => n._id === notificationId && !n.read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown time';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getOrderNumber = (orderId) => orderId ? orderId.toString().slice(-8).toUpperCase() : '';

  return (
    <div className="container-tgs py-12">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Notifications</h1>
          <p className="mt-2 text-sm text-charcoal/60">Stay updated with your orders and offers</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-charcoal/60">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
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
          {notifications.map((notification) => {
            if (!notification || !notification._id) return null;
            
            return (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`rounded-2xl bg-white p-6 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-primary-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 rounded-full bg-primary-500"></span>
                      )}
                      <h3 className="font-semibold text-charcoal">{notification.title || 'Notification'}</h3>
                    </div>
                    <p className="text-sm text-charcoal/70 mb-3">{notification.message || ''}</p>
                    {notification.order && notification.order._id && (
                      <Link
                        to={`/orders/${notification.order._id}`}
                        className="inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Order #{getOrderNumber(notification.order._id)} →
                      </Link>
                    )}
                    {notification.metadata && typeof notification.metadata === 'object' && (
                      <div className="mt-3 space-y-2">
                        {notification.metadata.googleReviewUrl && (
                          <a
                            href={notification.metadata.googleReviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ⭐ Review The Gift Shelf on Google
                          </a>
                        )}
                        {notification.metadata.whatsappUrl && (
                          <a
                            href={notification.metadata.whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-sm text-green-600 hover:text-green-700 font-medium ml-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            💬 WhatsApp Us
                          </a>
                        )}
                        {notification.metadata.cashbackOffer && (
                          <p className="text-xs text-charcoal/60 mt-1">{notification.metadata.cashbackOffer}</p>
                        )}
                      </div>
                    )}
                    <p className="mt-3 text-xs text-charcoal/40">{formatTime(notification.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="p-2 text-charcoal/40 hover:text-primary-600 transition-colors"
                        title="Mark as read"
                      >
                        <HiCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="p-2 text-charcoal/40 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
