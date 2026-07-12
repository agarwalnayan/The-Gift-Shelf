import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiXMark } from 'react-icons/hi2';
import { useMarketing } from '../../context/MarketingContext.jsx';

const SESSION_KEY = 'tgs_welcome_popup_shown';

// Admin-configurable launch popup. Shows after a configurable delay, and —
// when `showOncePerSession` is on — only once per browser session so it
// doesn't nag the customer on every page. Content and enabled/disabled
// state come from the shared MarketingContext (no extra network request).
const WelcomePopup = () => {
  const { welcomePopup, isLoading } = useMarketing();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading || !welcomePopup?.enabled) return undefined;

    if (welcomePopup.showOncePerSession && sessionStorage.getItem(SESSION_KEY)) {
      return undefined;
    }

    const delayMs = Math.max(0, (welcomePopup.delaySeconds ?? 2) * 1000);
    const timer = setTimeout(() => setIsVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoading, welcomePopup]);

  const handleClose = () => {
    setIsVisible(false);
    if (welcomePopup?.showOncePerSession) {
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
  };

  if (!isVisible || !welcomePopup?.enabled) return null;

  const isExternal = /^https?:\/\//.test(welcomePopup.ctaLink || '');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/50 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-charcoal/70 hover:text-charcoal"
        >
          <HiXMark size={18} />
        </button>

        {welcomePopup.image?.url && (
          <div className="aspect-[16/9] w-full bg-primary-100">
            <img src={welcomePopup.image.url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-6 text-center">
          {welcomePopup.title && (
            <h2 className="font-display text-xl font-semibold text-charcoal">{welcomePopup.title}</h2>
          )}
          {welcomePopup.description && <p className="mt-2 text-sm text-charcoal/70">{welcomePopup.description}</p>}

          {welcomePopup.ctaText && welcomePopup.ctaLink && (
            <div className="mt-5">
              {isExternal ? (
                <a href={welcomePopup.ctaLink} className="btn-primary inline-flex" target="_blank" rel="noreferrer">
                  {welcomePopup.ctaText}
                </a>
              ) : (
                <Link to={welcomePopup.ctaLink} className="btn-primary inline-flex" onClick={handleClose}>
                  {welcomePopup.ctaText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
