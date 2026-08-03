import { Link } from 'react-router-dom';

const ShoppingIntentSection = ({ featuredSections = [] }) => {
  if (!featuredSections || featuredSections.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-[#FAF7F2] to-white py-16 lg:py-24">
      <div className="container-tgs">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-4 font-display text-4xl font-semibold leading-tight text-charcoal lg:text-5xl">
            Find the Perfect
            <br />
            Raksha Bandhan Gift
          </h2>
          <p className="mx-auto max-w-[500px] text-sm leading-relaxed text-neutral-600 lg:text-base">
            Thoughtfully curated for every sibling bond.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSections.map((section, index) => (
            <Link
              key={section._id || index}
              to={`/featured/${section.slug}`}
              className="group block h-[520px] overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                animation: `fadeUp 0.6s ease-out ${index * 0.15}s both`,
              }}
            >
              {/* Image Container - ~72% height */}
              <div className="relative h-[375px] overflow-hidden bg-neutral-100">
                {section.image?.url ? (
                  <img
                    src={section.image.url}
                    alt={section.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-200 font-display text-3xl text-neutral-400">
                    {section.title?.[0] || '?'}
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>

              {/* Content - ~28% height */}
              <div className="flex h-[145px] flex-col justify-center px-6 py-6">
                <h3 className="mb-3 font-display text-xl font-semibold text-charcoal">
                  {section.title}
                </h3>
                <p className="mb-4 text-sm leading-6 text-neutral-600">
                  {section.description}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary-700 transition-transform duration-300 group-hover:translate-x-1">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ShoppingIntentSection;
