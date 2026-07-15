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
    <section className="container-tgs py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between sm:mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Budget</h2>
          <p className="mt-1.5 text-sm text-charcoal/60">Gifts for every price range</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {collections.map((collection) => (
          <Link
            key={collection._id}
            to={buildLink(collection)}
            className="group flex flex-col items-center"
          >
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-primary-50 shadow-sm transition-all duration-200 group-hover:shadow-lg">
              {collection.image?.url ? (
                <img
                  src={collection.image.url}
                  alt={collection.label}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl text-primary-300">
                  {collection.label?.[0]}
                </div>
              )}
            </div>
            <p className="mt-2.5 truncate text-center text-sm font-medium text-charcoal">{collection.label}</p>
            {collection.productCount !== undefined && (
              <p className="mt-1 text-center text-xs text-charcoal/60">{collection.productCount} products</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BudgetCollections;
