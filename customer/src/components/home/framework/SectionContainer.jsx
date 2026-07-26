import { memo } from 'react';

/**
 * Reusable Section Container
 * Provides consistent spacing, responsive width, and styling for all homepage sections
 */
const SectionContainer = memo(({ 
  children, 
  className = '', 
  background = 'default',
  padding = 'default',
  fullWidth = false 
}) => {
  const backgroundStyles = {
    default: 'bg-white',
    cream: 'bg-[#FAF7F3]',
    charcoal: 'bg-charcoal',
  };

  const paddingStyles = {
    default: 'py-10 sm:py-12',
    compact: 'py-6 sm:py-8',
    spacious: 'py-12 sm:py-16',
    none: '',
  };

  const containerClass = fullWidth 
    ? 'w-full' 
    : 'container-tgs';

  return (
    <section 
      className={`${backgroundStyles[background] || backgroundStyles.default} ${paddingStyles[padding] || paddingStyles.default} ${className}`}
    >
      <div className={containerClass}>
        {children}
      </div>
    </section>
  );
});

SectionContainer.displayName = 'SectionContainer';

export default SectionContainer;
