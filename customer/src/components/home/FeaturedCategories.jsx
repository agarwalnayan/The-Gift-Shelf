import { Link } from 'react-router-dom';

const FeaturedCategories = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="container-tgs py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between sm:mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Category</h2>
          <p className="mt-1.5 text-sm text-charcoal/60">Find the perfect gift type</p>
        </div>
        <Link to="/categories" className="text-sm font-medium text-primary-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category._id}
            to={`/products?category=${category._id}`}
            className="group w-32 shrink-0 sm:w-auto"
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-primary-50 shadow-sm transition-all duration-200 group-hover:shadow-lg">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl text-primary-300">
                  {category.name?.[0]}
                </div>
              )}
            </div>
            <p className="mt-2.5 truncate text-center text-sm font-medium text-charcoal">{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
