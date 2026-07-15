import { useState, useEffect } from 'react';

const AnnouncementBar = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div 
      className="bg-charcoal text-cream overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-marquee'}`}>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          🎉 WE ARE LIVE
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          FLAT 20% OFF
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          FREE DELIVERY
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          USE CODE LAUNCH20
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          🎉 WE ARE LIVE
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          FLAT 20% OFF
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          FREE DELIVERY
        </span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">•</span>
        <span className="mx-12 text-sm font-medium uppercase tracking-wide">
          USE CODE LAUNCH20
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
