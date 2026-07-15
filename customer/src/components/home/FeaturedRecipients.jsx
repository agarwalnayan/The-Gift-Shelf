import { Link } from 'react-router-dom';

const MAX_RECIPIENTS = 6;

/**
 * "Shop by Recipient" — circular icon slider (premium storefront pattern).
 * Admin controls order (displayOrder), icon (image), and visibility
 * (isActive) via the existing Marketing module; this component only ever
 * renders the first 6, defensively, even if more were ever returned.
 */
const FeaturedRecipients = ({ items }) => {
  const recipients = (items || []).slice(0, MAX_RECIPIENTS);

  if (recipients.length === 0) return null;

  return (
    <section className="container-tgs py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between sm:mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Shop by Recipient</h2>
          <p className="mt-1.5 text-sm text-charcoal/60">Gifts for everyone on your list</p>
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible">
        {recipients.map((item) => (
          <Link
            key={item._id}
            to={`/products?recipient=${encodeURIComponent(item.value)}`}
            className="group flex shrink-0 snap-start flex-col items-center gap-3 text-center"
          >
            <div className="h-20 w-20 overflow-hidden rounded-full bg-primary-100 ring-1 ring-charcoal/5 transition-transform duration-200 group-hover:scale-105 sm:h-24 sm:w-24">
              {item.image?.url && (
                <img src={item.image.url} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="w-20 text-sm font-medium text-charcoal sm:w-24">{item.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedRecipients;
