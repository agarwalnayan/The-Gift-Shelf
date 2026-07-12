import { useState } from 'react';

/**
 * Fullscreen first-visit screen. Asks only for a first name, once, before
 * the Launch Welcome Popup is ever shown. MainLayout is responsible for
 * deciding whether to mount this at all (it skips it entirely when a name
 * is already saved in localStorage, or when the customer is logged in).
 */
const FirstVisitWelcomeScreen = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please share your first name to continue');
      return;
    }
    onComplete(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal px-6">
      <div className="w-full max-w-sm text-center">
        <p className="font-display text-2xl font-semibold text-cream sm:text-3xl">Welcome to The Gift Shelf</p>
        <p className="mt-3 text-sm text-cream/70">
          Tell us your first name so we can make your visit feel a little more personal.
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
            placeholder="Your first name"
            className="w-full rounded-xl border border-cream/20 bg-transparent px-4 py-3 text-center text-cream placeholder:text-cream/40 focus:border-primary-400 focus:outline-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstVisitWelcomeScreen;
