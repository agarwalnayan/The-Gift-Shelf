import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

const FestivalHero = ({ festival }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!festival?.countdownDate) return;

    const calculateTimeLeft = () => {
      const countdownDate = new Date(festival.countdownDate);
      const now = new Date();
      const difference = countdownDate - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [festival?.countdownDate]);

  if (!festival) return null;

  const hasCountdown = festival.countdownDate && timeLeft.days > 0;

  return (
    <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-10 sm:py-12">
      <div className="container-tgs">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
              {festival.heroTitle || festival.name}
            </h2>
            <p className="mt-1.5 text-sm text-charcoal/60">
              {festival.heroSubtitle || `Celebrate ${festival.name} with exclusive gifts`}
            </p>
          </div>
          {festival.landingPage && (
            <Link
              to={`/${festival.landingPage}`}
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {festival.deliveryMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <HiOutlineCalendar size={16} />
            <span>{festival.deliveryMessage}</span>
          </div>
        )}

        {hasCountdown && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-charcoal px-4 py-3 text-white">
            <HiOutlineClock size={16} />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink/60">Countdown:</span>
              <span className="font-mono font-semibold">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          </div>
        )}

        {(festival.primaryCtaText || festival.secondaryCtaText) && (
          <div className="flex flex-wrap gap-3">
            {festival.primaryCtaText && festival.primaryCtaLink && (
              <Link
                to={festival.primaryCtaLink}
                className="btn-primary inline-flex"
              >
                {festival.primaryCtaText}
              </Link>
            )}
            {festival.secondaryCtaText && festival.secondaryCtaLink && (
              <Link
                to={festival.secondaryCtaLink}
                className="btn-secondary inline-flex"
              >
                {festival.secondaryCtaText}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FestivalHero;
