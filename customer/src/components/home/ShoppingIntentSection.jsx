import { Link } from 'react-router-dom';

const ShoppingIntentSection = ({ featuredSections = [], festival }) => {
  if (!featuredSections || featuredSections.length === 0) return null;

  const sectionTitle = festival?.homepage?.title || (festival?.name ? `Gifts for ${festival.name}` : 'Curated Collections');
  const sectionSubtitle =
    festival?.homepage?.subtitle || 'Thoughtfully curated gift ideas for every moment';

  return (
    <div className="bg-gradient-to-b from-[#FAF7F2] to-white py-12 lg:py-20">
      <div className="container-tgs">
        <div className="mb-8 text-center lg:mb-12">
          <h2 className="font-display text-3xl font-semibold leading-tight text-charcoal sm:text-4xl lg:text-5xl">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mx-auto mt-3 max-w-[500px] text-sm leading-relaxed text-neutral-600 lg:text-base">
              {sectionSubtitle}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featuredSections.map((section, index) => (
            <Link
              key={section._id || index}
              to={`/featured/${section.slug}`}
              className="group block overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <h3 className="font-display text-lg font-semibold text-charcoal sm:text-xl">{section.title}</h3>
                {section.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">{section.description}</p>
                )}
                <span className="mt-4 inline-flex items-center text-sm font-medium text-primary-700 transition-transform duration-300 group-hover:translate-x-1">
                  Shop collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShoppingIntentSection;
