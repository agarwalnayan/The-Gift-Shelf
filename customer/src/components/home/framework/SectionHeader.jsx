import { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Section Header
 * Supports title, subtitle, and optional CTA button
 * No hardcoded text
 */
const SectionHeader = memo(({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink,
  align = 'left',
  className = ''
}) => {
  const alignmentStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`mb-6 flex items-end justify-between sm:mb-8 ${alignmentStyles[align]} ${className}`}>
      <div>
        {title && (
          <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-1.5 text-sm text-charcoal/60">
            {subtitle}
          </p>
        )}
      </div>
      {ctaText && ctaLink && (
        <Link 
          to={ctaLink} 
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          {ctaText}
        </Link>
      )}
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
