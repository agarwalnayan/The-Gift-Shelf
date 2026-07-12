import { Link } from 'react-router-dom';

const MAX_OCCASIONS = 6;

/**
 * "Shop by Occasion" — premium grid cards (full-bleed image + gradient
 * overlay + hover lift). Admin controls order, icon/image, and visibility
 * via the existing Marketing module; only the first 6 are ever rendered.
 */
const FeaturedOccasions = ({ items }) => {
  const occasions = (items || []).slice(0, MAX_OCCASIONS);

  if (occasions.length === 0) return null;

  return (
    <section className="border-t border-charcoal/10 bg-primary-50/40">
      <div className="container-tgs py-14 sm:py-16">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Occasion</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {occasions.map((item) => (
            <Link
              key={item._id}
              to={`/products?occasion=${encodeURIComponent(item.value)}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {item.image?.url && (
                <img
                  src={item.image.url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/5 to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-base font-semibold text-cream sm:text-lg">
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedOccasions;
