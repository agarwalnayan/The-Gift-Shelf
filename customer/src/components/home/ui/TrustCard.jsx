import { transitions, shadows, borderRadius } from '../design/tokens.js';

/**
 * TrustCard - Single trust indicator with icon and text
 * Used in trust strips and trust sections
 */
const TrustCard = ({ icon, title, description, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center text-center ${className}`}
      style={{
        transition: `transform ${transitions.normal}`,
      }}
    >
      {icon && (
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50"
          style={{
            boxShadow: shadows.card.default,
          }}
        >
          {typeof icon === 'string' ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}
      {title && (
        <h4 className="font-display text-sm font-semibold text-charcoal">{title}</h4>
      )}
      {description && (
        <p className="mt-1 text-xs text-charcoal/60">{description}</p>
      )}
    </div>
  );
};

export default TrustCard;
