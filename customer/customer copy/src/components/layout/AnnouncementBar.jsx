import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

const STORAGE_KEY = 'tgs_announcement_dismissed';

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-charcoal text-cream">
      <div className="container-tgs flex items-center justify-center gap-2 py-2 text-center text-xs font-medium sm:text-sm">
        <span>Free shipping on orders over ₹999 · Personalized gifts crafted with care</span>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/70 hover:text-cream"
      >
        <HiXMark size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
