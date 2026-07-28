import SectionHeader from './framework/SectionHeader.jsx';

/**
 * DiscoverySection - Reusable layout for discovery sections
 * Used by Recipient, Occasion, and Budget sections
 * Provides consistent header and grid layout
 */
const DiscoverySection = ({ title, subtitle, children, layout = 'grid', className = '' }) => {
  const layoutStyles = {
    grid: 'grid grid-cols-2 gap-4 sm:grid-cols-3',
    carousel: 'flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible',
    budget: 'grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8',
  };

  return (
    <>
      <SectionHeader
        title={title}
        subtitle={subtitle}
      />

      <div className={layoutStyles[layout] || layoutStyles.grid}>
        {children}
      </div>
    </>
  );
};

export default DiscoverySection;
