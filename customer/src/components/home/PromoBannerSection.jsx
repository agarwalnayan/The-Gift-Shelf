import { Link } from 'react-router-dom';

// Renders admin-managed Promotional Banners (distinct from the Hero
// Slider) as a grid strip further down the homepage.
const PromoBannerSection = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="container-tgs py-10 sm:py-12">
      <div className={`grid gap-4 ${banners.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        {banners.map((banner) => {
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

          if (!banner.ctaLink) return <div key={banner._id}>{content}</div>;

          return isExternal ? (
            <a key={banner._id} href={banner.ctaLink} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <Link key={banner._id} to={banner.ctaLink}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PromoBannerSection;
