/**
 * HomeSection - Reusable section wrapper for homepage
 * Controls max width, horizontal padding, vertical spacing, and background
 */
const HomeSection = ({ children, background = 'white', className = '' }) => {
  const backgroundStyles = {
    white: 'bg-white',
    warm: 'bg-cream',
  };

  return (
    <section className={`${backgroundStyles[background] || backgroundStyles.white} ${className}`}>
      <div className="container-tgs py-8 sm:py-10 lg:py-12">
        {children}
      </div>
    </section>
  );
};

export default HomeSection;
