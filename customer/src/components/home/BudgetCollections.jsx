import { Link } from 'react-router-dom';

// "Shop by Budget" section — the 3 admin-managed price tiers (Under ₹499,
// ₹500-₹999, Premium). Each card links into the existing product listing
// price filter (/products?minPrice=...&maxPrice=...).
const BudgetCollections = ({ collections }) => {
  if (!collections || collections.length === 0) return null;

  const buildLink = (collection) => {
    const params = new URLSearchParams();
    if (collection.minPrice) params.set('minPrice', collection.minPrice);
    if (collection.maxPrice) params.set('maxPrice', collection.maxPrice);
    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  };

  return (
    <section className="container-tgs py-14 sm:py-16">
      <div className="mb-8 flex items-end justify-between sm:mb-10">
        <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Budget</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection._id}
            to={buildLink(collection)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary-100"
          >
            {collection.image?.url && (
              <img
                src={collection.image.url}
                alt={collection.label}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent p-5">
              <p className="font-display text-lg font-semibold text-cream">{collection.label}</p>
              {collection.description && <p className="mt-1 text-sm text-cream/80">{collection.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BudgetCollections;
