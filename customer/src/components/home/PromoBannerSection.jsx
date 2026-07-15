import { Link } from 'react-router-dom';

// Renders admin-managed Promotional Banners (distinct from the Hero
// Slider) as a grid strip further down the homepage.
// Accepts optional startIndex to show banners from a specific position
const PromoBannerSection = ({ banners, startIndex = 0 }) => {
  if (!banners || banners.length === 0) return null;

  // Get banner at the specified index, or null if index is out of bounds
  const banner = banners[startIndex];
  if (!banner) return null;

  const isExternal = /^https?:\/\//.test(banner.ctaLink || '');
  const content = (
    <div className="group relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-primary-100">
      {banner.image?.url && (
        <img
          src={banner.image.url}
          alt={banner.title || ''}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-charcoal/60 via-transparent to-transparent p-5">
          {banner.subtitle && <p className="text-xs font-medium uppercase tracking-wide text-cream/80">{banner.subtitle}</p>}
          {banner.title && <p className="mt-1 font-display text-lg font-semibold text-cream">{banner.title}</p>}
        </div>
      )}
    </div>
  );

  if (!banner.ctaLink) return <div>{content}</div>;

  return isExternal ? (
    <a href={banner.ctaLink} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <Link to={banner.ctaLink}>
      {content}
    </Link>
  );
};

export default PromoBannerSection;
