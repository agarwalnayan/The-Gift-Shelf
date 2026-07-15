import { useState, useEffect } from 'react';

const LaunchPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('launchPopupSeen');
    const lastSeen = localStorage.getItem('launchPopupLastSeen');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!hasSeenPopup || (lastSeen && now - parseInt(lastSeen) > twentyFourHours)) {
      setIsOpen(true);
      setShowConfetti(true);
      localStorage.setItem('launchPopupSeen', 'true');
      localStorage.setItem('launchPopupLastSeen', now.toString());
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('LAUNCH20');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-fade-in">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-charcoal/40 hover:text-charcoal transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8">
          <span className="text-5xl">🎁</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-charcoal mb-1">
          Welcome to
        </h2>
        <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">
          The Gift Shelf
        </h2>

        <p className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-8">
          Launch Offer
        </p>

        <p className="text-sm text-charcoal/60 mb-6">
          Celebrate our launch with
        </p>

        <div className="mb-8 space-y-2">
          <div className="text-4xl font-bold text-charcoal">Flat 20% OFF</div>
          <div className="text-xl font-medium text-charcoal">+ FREE DELIVERY</div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-3">Coupon</p>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl px-8 py-4">
              <span className="font-display text-2xl font-bold text-primary-600">LAUNCH20</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-charcoal text-cream py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors"
        >
          Continue Shopping
        </button>

        <p className="mt-6 text-xs text-charcoal/40">
          Offer valid for a limited period.
        </p>
      </div>
    </div>
  );
};

export default LaunchPopup;
