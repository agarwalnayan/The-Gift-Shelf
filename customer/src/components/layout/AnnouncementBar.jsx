import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiXMark } from 'react-icons/hi2';
import { useMarketing } from '../../context/MarketingContext.jsx';

const STORAGE_KEY = 'tgs_announcement_dismissed';

// Now driven entirely by the admin-configurable Announcement Bar (via
// MarketingContext, which fetches the homepage bundle exactly once) instead
// of hardcoded copy. The dismissal key is scoped to the message itself, so
// a newly-changed announcement reappears for customers who dismissed an
// older one.
const AnnouncementBar = () => {
  const { announcementBar, isLoading } = useMarketing();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (isLoading || !announcementBar?.enabled || !announcementBar?.message) return;
    const dismissedMessage = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(announcementBar.dismissible && dismissedMessage === announcementBar.message);
  }, [isLoading, announcementBar]);

  if (isLoading || !announcementBar?.enabled || !announcementBar?.message || isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, announcementBar.message);
    setIsDismissed(true);
  };

  const isExternal = /^https?:\/\//.test(announcementBar.linkUrl || '');

  return (
    <div
      className="relative"
      style={{ backgroundColor: announcementBar.backgroundColor, color: announcementBar.textColor }}
    >
      <div className="container-tgs flex items-center justify-center gap-2 py-2 text-center text-xs font-medium sm:text-sm">
        <span>{announcementBar.message}</span>
        {announcementBar.linkText && announcementBar.linkUrl && (
          isExternal ? (
            <a href={announcementBar.linkUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
              {announcementBar.linkText}
            </a>
          ) : (
            <Link to={announcementBar.linkUrl} className="underline underline-offset-2">
              {announcementBar.linkText}
            </Link>
          )
        )}
      </div>
      {announcementBar.dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
        >
          <HiXMark size={16} />
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;
