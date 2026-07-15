import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Premium modal for first-visit name collection. Shows once before
 * the Launch Welcome Popup. MainLayout controls mounting.
 */
const FirstVisitWelcomeScreen = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please share your first name to continue');
      return;
    }
    toast.success(`Welcome, ${trimmed} 👋`);
    onComplete(trimmed);
  };

  const handleSkip = () => {
    onComplete('');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm px-6 animate-fade-in">
      <div className="w-full max-w-[400px] rounded-3xl bg-white shadow-2xl p-8 text-center animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 text-charcoal/40 hover:text-charcoal transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
          Welcome to
        </p>
        <p className="font-display text-2xl font-semibold text-charcoal sm:text-3xl mt-1">
          The Gift Shelf
        </p>
        
        <p className="mt-4 text-sm text-charcoal/60">
          Let's personalise your experience.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            autoFocus
            type="text"
            value={name}
            maxLength={40}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="First Name"
            className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-center text-charcoal placeholder:text-charcoal/40 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          
          <button type="submit" className="btn-primary w-full justify-center">
            Continue
          </button>
          
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstVisitWelcomeScreen;
