import { Link } from 'react-router-dom';

// The backend has no collections/tags API. These are static promotional cards
// (as instructed) that link to /products, using only query params the listing
// page already supports (sort=newest, sort=rating) - no invented filters.
const collections = [
  { label: 'Birthday Gifts', to: '/products', tone: 'bg-primary-100' },
  { label: 'Anniversary Gifts', to: '/products', tone: 'bg-rose-100' },
  { label: 'Wedding Gifts', to: '/products', tone: 'bg-amber-100' },
  { label: 'For Him', to: '/products', tone: 'bg-charcoal/10' },
  { label: 'For Her', to: '/products', tone: 'bg-primary-100' },
  { label: 'Premium Gifts', to: '/products', tone: 'bg-charcoal/10' },
  { label: 'New Arrivals', to: '/products?sort=newest', tone: 'bg-rose-100' },
  { label: 'Best Sellers', to: '/products?sort=rating', tone: 'bg-amber-100' },
];

const CollectionsSection = () => {
  return (
    <section className="container-tgs py-14 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Occasion</h2>
        <p className="mt-1.5 text-sm text-charcoal/60">Find the perfect gift for every celebration.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible lg:grid-cols-8">
        {collections.map((collection) => (
          <Link
            key={collection.label}
            to={collection.to}
            className={`flex h-24 w-32 shrink-0 items-center justify-center rounded-2xl px-3 text-center text-sm font-semibold text-charcoal transition-transform hover:-translate-y-0.5 sm:h-28 sm:w-auto ${collection.tone}`}
          >
            {collection.label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CollectionsSection;
