import { useState } from 'react';
import { useMarketing } from '../../context/MarketingContext.jsx';

// Admin-configurable announcement bar. Content, colors, link, and whether it
// can be dismissed all come from SiteSettings.announcementBar (see the
// "Dynamic Announcement Bar" form in the admin panel) via MarketingContext —
// nothing here is hardcoded.
const AnnouncementBar = () => {
  const { announcementBar } = useMarketing();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!announcementBar?.enabled || !announcementBar?.message || isDismissed) return null;

  const isExternal = /^https?:\/\//.test(announcementBar.linkUrl || '');

  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-center text-sm font-medium"
      style={{
        backgroundColor: announcementBar.backgroundColor || '#1c1c1c',
        color: announcementBar.textColor || '#fdfaf6',
      }}
    >
      <span>
        {announcementBar.message}
        {announcementBar.linkText && announcementBar.linkUrl && (
          <>
            {' '}
            {isExternal ? (
              <a href={announcementBar.linkUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {announcementBar.linkText}
              </a>
            ) : (
              <a href={announcementBar.linkUrl} className="underline underline-offset-2">
                {announcementBar.linkText}
              </a>
            )}
          </>
        )}
      </span>

      {announcementBar.dismissible && (
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;