import { Link } from 'react-router-dom';

// "Shop by Recipient" homepage section, admin-managed (max 5-6 tiles).
// Each tile links into the existing product listing filter
// (/products?recipient=<value>) — no new taxonomy needed on the product side.
const FeaturedRecipients = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="container-tgs py-14 sm:py-16">
      <div className="mb-8 flex items-end justify-between sm:mb-10">
        <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Recipient</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/products?recipient=${encodeURIComponent(item.value)}`}
            className="group flex flex-col items-center gap-3 text-center"
          >
            <div className="aspect-square w-full overflow-hidden rounded-full bg-primary-100">
              {item.image?.url && (
                <img
                  src={item.image.url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="text-sm font-medium text-charcoal">{item.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedRecipients;
